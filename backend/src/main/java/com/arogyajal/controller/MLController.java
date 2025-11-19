package com.arogyajal.controller;

import com.arogyajal.model.SymptomReport;
import com.arogyajal.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Controller for ML-related endpoints
 * Proxies requests to the Python ML service
 */
@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, 
           allowedHeaders = "*", 
           allowCredentials = "true")
@RequestMapping("/api")
@Tag(name = "ML Controller", description = "APIs for ML predictions and analysis")
public class MLController {
    
    private static final Logger log = LoggerFactory.getLogger(MLController.class);
    
    @Value("${ml.python.api.url:http://localhost:5000}")
    private String mlServiceUrl;
    
    private final RestTemplate restTemplate;
    private final SymptomService symptomService;
    private final CacheManager cacheManager;
    
    // Simple cache for symptom clusters (30 second TTL)
    private Map<String, Object> cachedSymptomClusters = null;
    private long clusterCacheTimestamp = 0;
    private static final long CLUSTER_CACHE_TTL_MS = 30000; // 30 seconds
    
    public MLController(RestTemplate restTemplate, SymptomService symptomService, CacheManager cacheManager) {
        this.restTemplate = restTemplate;
        this.symptomService = symptomService;
        this.cacheManager = cacheManager;
    }
    
    /**
     * Get symptom clusters from ML service
     * Fetches symptom reports from database and sends to ML service for clustering
     * CACHED for 30 seconds to reduce redundant ML calls
     */
    @GetMapping("/symptom-clusters")
    @Operation(summary = "Get symptom clusters", description = "Retrieve symptom clustering analysis from ML service")
    public ResponseEntity<Map<String, Object>> getSymptomClusters() {
        log.info("Fetching symptom clusters from ML service");
        
        // Check cache first
        long now = System.currentTimeMillis();
        if (cachedSymptomClusters != null && (now - clusterCacheTimestamp) < CLUSTER_CACHE_TTL_MS) {
            log.info("✅ Returning cached symptom clusters (age: {}ms)", now - clusterCacheTimestamp);
            return ResponseEntity.ok(cachedSymptomClusters);
        }
        
        try {
            // First check if ML service is available
            String healthUrl = mlServiceUrl + "/health";
            try {
                restTemplate.getForEntity(healthUrl, Map.class);
            } catch (Exception e) {
                log.warn("ML service not available, returning empty response");
                return ResponseEntity.ok(createEmptyClusterResponse());
            }
            
            // Fetch symptom reports from database
            List<SymptomReport> reports = symptomService.getAllSymptomReports();
            
            if (reports.isEmpty()) {
                log.info("No symptom reports available for clustering");
                Map<String, Object> emptyResponse = createEmptyClusterResponse();
                cachedSymptomClusters = emptyResponse;
                clusterCacheTimestamp = now;
                return ResponseEntity.ok(emptyResponse);
            }
            
            log.info("Fetched {} symptom reports for clustering", reports.size());
            
            // Transform reports for ML service
            List<Map<String, Object>> transformedReports = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            
            for (SymptomReport report : reports) {
                Map<String, Object> transformed = new HashMap<>();
                transformed.put("id", report.getId());
                transformed.put("location", report.getLocation());
                transformed.put("symptoms", report.getSymptoms());
                transformed.put("severity", report.getSeverity());
                transformed.put("geoLocation", report.getGeoLocation());
                
                // Convert timestamp to ISO format without timezone
                if (report.getReportedAt() != null) {
                    Instant instant = Instant.ofEpochSecond(report.getReportedAt().getSeconds());
                    transformed.put("reportDate", formatter.format(instant.atZone(ZoneId.systemDefault())));
                } else {
                    transformed.put("reportDate", formatter.format(Instant.now().atZone(ZoneId.systemDefault())));
                }
                
                transformedReports.add(transformed);
            }
            
            // Call ML clustering endpoint
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("reports", transformedReports);
            
            String clusterUrl = mlServiceUrl + "/api/ml/cluster";
            log.info("Calling ML clustering at: {}", clusterUrl);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(clusterUrl, requestBody, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                result.put("total_reports", reports.size());
                log.info("Successfully clustered {} reports into {} clusters", 
                        reports.size(), result.get("cluster_count"));
                
                // Update cache
                cachedSymptomClusters = result;
                clusterCacheTimestamp = now;
                
                // Evict dashboard stats cache since cluster count changed
                evictDashboardCache();
                
                return ResponseEntity.ok(result);
            } else {
                log.warn("ML clustering returned non-success status");
                Map<String, Object> emptyResponse = createEmptyClusterResponse();
                cachedSymptomClusters = emptyResponse;
                clusterCacheTimestamp = now;
                return ResponseEntity.ok(emptyResponse);
            }
            
        } catch (Exception e) {
            log.error("Error fetching symptom clusters from ML service", e);
            Map<String, Object> emptyResponse = createEmptyClusterResponse();
            // Cache error response too to avoid repeated failures
            cachedSymptomClusters = emptyResponse;
            clusterCacheTimestamp = now;
            return ResponseEntity.ok(emptyResponse);
        }
    }
    
    /**
     * Manually trigger symptom clustering analysis
     * POST endpoint for frontend "Run ML Clustering" button
     * Clears cache to force fresh clustering
     */
    @PostMapping("/symptom-clusters/analyze")
    @Operation(summary = "Trigger clustering analysis", description = "Manually trigger ML clustering analysis")
    public ResponseEntity<Map<String, Object>> triggerClustering() {
        log.info("Manual clustering analysis triggered - clearing cache");
        
        // Clear cache to force fresh clustering
        cachedSymptomClusters = null;
        clusterCacheTimestamp = 0;
        
        ResponseEntity<Map<String, Object>> result = getSymptomClusters();
        
        // Evict dashboard cache after manual clustering
        evictDashboardCache();
        
        return result;
    }
    
    /**
     * Helper method to evict dashboard cache when clusters change
     */
    private void evictDashboardCache() {
        try {
            if (cacheManager.getCache("stats") != null) {
                // Evict both cache keys used by dashboard
                cacheManager.getCache("stats").evict("dashboard");
                cacheManager.getCache("stats").evict("dashboard-stats");
                log.info("✅ Evicted dashboard stats cache after clustering");
            }
        } catch (Exception e) {
            log.warn("Failed to evict dashboard cache: {}", e.getMessage());
        }
    }
    
    /**
     * Get outbreak predictions from ML service
     * Fetches data from database and sends to ML service for prediction
     */
    @GetMapping("/outbreak-predictions")
    @Operation(summary = "Get outbreak predictions", description = "Retrieve outbreak prediction analysis from ML service")
    public ResponseEntity<Map<String, Object>> getOutbreakPredictions() {
        log.info("Fetching outbreak predictions from ML service");
        
        try {
            // Check if ML service is available
            String healthUrl = mlServiceUrl + "/health";
            try {
                restTemplate.getForEntity(healthUrl, Map.class);
            } catch (Exception e) {
                log.warn("ML service not available, returning empty response");
                return ResponseEntity.ok(createEmptyOutbreakResponse());
            }
            
            // Get clusters from ML service
            ResponseEntity<Map<String, Object>> clusterResponse = getSymptomClusters();
            Map<String, Object> clusterData = clusterResponse.getBody();
            
            if (clusterData == null || !clusterData.containsKey("clusters")) {
                log.info("No cluster data available for outbreak prediction");
                return ResponseEntity.ok(createEmptyOutbreakResponse());
            }
            
            // Prepare data for ML outbreak prediction
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("clusters", clusterData.get("clusters"));
            requestBody.put("water_tests", new ArrayList<>());
            requestBody.put("reports", new ArrayList<>());
            
            String outbreakUrl = mlServiceUrl + "/api/ml/predict-outbreak";
            log.info("Calling ML outbreak prediction at: {}", outbreakUrl);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(outbreakUrl, requestBody, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("Successfully predicted outbreak risk: {}", result.get("risk_level"));
                return ResponseEntity.ok(result);
            } else {
                log.warn("ML outbreak prediction returned non-success status");
                return ResponseEntity.ok(createEmptyOutbreakResponse());
            }
            
        } catch (Exception e) {
            log.error("Error fetching outbreak predictions from ML service", e);
            return ResponseEntity.ok(createEmptyOutbreakResponse());
        }
    }
    
    /**
     * Get risk assessment from ML service
     */
    /**
     * Get latest outbreak predictions from ML service
     * Alias for /outbreak-predictions for frontend compatibility
     */
    @GetMapping("/outbreak-predictions/latest")
    @Operation(summary = "Get latest outbreak predictions", description = "Retrieve latest outbreak prediction analysis from ML service")
    public ResponseEntity<Map<String, Object>> getLatestOutbreakPredictions() {
        log.info("Fetching latest outbreak predictions from ML service");
        return getOutbreakPredictions(); // Reuse the same logic
    }
    
    @GetMapping("/risk-assessment")
    @Operation(summary = "Get risk assessment", description = "Retrieve risk assessment analysis from ML service")
    public ResponseEntity<Map<String, Object>> getRiskAssessment(
            @RequestParam(required = false) String location) {
        log.info("Fetching risk assessment from ML service for location: {}", location);
        
        try {
            // Check if ML service is available
            String healthUrl = mlServiceUrl + "/health";
            try {
                restTemplate.getForEntity(healthUrl, Map.class);
            } catch (Exception e) {
                log.warn("ML service not available, returning empty response");
                return ResponseEntity.ok(createEmptyRiskResponse());
            }
            
            // ML service is available but needs data
            // TODO: Fetch reports, clusters, and water tests for the location
            log.info("ML service available but risk assessment requires location data");
            return ResponseEntity.ok(createEmptyRiskResponse());
            
        } catch (Exception e) {
            log.error("Error fetching risk assessment from ML service", e);
            return ResponseEntity.ok(createEmptyRiskResponse());
        }
    }
    
    /**
     * Predict water quality from ML service
     */
    @PostMapping("/predict-wqi")
    @Operation(summary = "Predict water quality", description = "Predict water quality index from sensor parameters")
    public ResponseEntity<Map<String, Object>> predictWQI(@RequestBody Map<String, Object> sensorData) {
        log.info("Predicting WQI from ML service");
        
        try {
            String url = mlServiceUrl + "/predict";
            log.info("Calling ML service at: {}", url);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, sensorData, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Successfully predicted WQI");
                return ResponseEntity.ok((Map<String, Object>) response.getBody());
            } else {
                log.warn("ML service returned non-success status: {}", response.getStatusCode());
                Map<String, Object> fallback = new HashMap<>();
                fallback.put("wqi", 50.0);
                fallback.put("quality_status", "Medium");
                fallback.put("error", "ML service unavailable");
                return ResponseEntity.ok(fallback);
            }
            
        } catch (Exception e) {
            log.error("Error predicting WQI from ML service", e);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("wqi", 50.0);
            fallback.put("quality_status", "Medium");
            fallback.put("error", e.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }
    
    /**
     * ML service health check
     */
    @GetMapping("/ml/health")
    @Operation(summary = "ML service health check", description = "Check if ML service is available")
    public ResponseEntity<Map<String, Object>> mlHealthCheck() {
        log.info("Checking ML service health");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String url = mlServiceUrl + "/health";
            ResponseEntity<Map> mlResponse = restTemplate.getForEntity(url, Map.class);
            
            if (mlResponse.getStatusCode().is2xxSuccessful()) {
                response.put("status", "UP");
                response.put("mlService", "AVAILABLE");
                response.put("mlServiceUrl", mlServiceUrl);
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "DOWN");
                response.put("mlService", "UNAVAILABLE");
                response.put("mlServiceUrl", mlServiceUrl);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
        } catch (Exception e) {
            log.error("ML service health check failed", e);
            response.put("status", "DOWN");
            response.put("mlService", "UNAVAILABLE");
            response.put("mlServiceUrl", mlServiceUrl);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
    
    // Helper methods to create empty responses
    
    private Map<String, Object> createEmptyClusterResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("clusters", new ArrayList<>());
        response.put("total_reports", 0);
        response.put("num_clusters", 0);
        response.put("message", "No cluster data available - either ML service is unavailable or no symptom reports exist");
        response.put("status", "empty");
        return response;
    }
    
    private Map<String, Object> createEmptyOutbreakResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("outbreak_risk", "LOW");
        response.put("risk_score", 0.0);
        response.put("confidence", 0);
        response.put("affected_locations", new ArrayList<>());
        
        // Add risk_factors structure for frontend compatibility
        Map<String, Double> riskFactors = new HashMap<>();
        riskFactors.put("cluster_factor", 0.0);
        riskFactors.put("report_factor", 0.0);
        riskFactors.put("quality_factor", 0.0);
        riskFactors.put("water_factor", 0.0);
        response.put("risk_factors", riskFactors);
        
        response.put("recommendations", new ArrayList<>());
        response.put("message", "No outbreak data available - either ML service is unavailable or insufficient data");
        response.put("status", "empty");
        return response;
    }
    
    private Map<String, Object> createEmptyRiskResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("overall_risk", "LOW");
        response.put("risk_score", 0.0);
        
        // Add risk_factors structure
        Map<String, Double> riskFactors = new HashMap<>();
        riskFactors.put("symptom_risk", 0.0);
        riskFactors.put("cluster_risk", 0.0);
        riskFactors.put("water_risk", 0.0);
        response.put("risk_factors", riskFactors);
        
        response.put("message", "No risk data available - either ML service is unavailable or no data for location");
        response.put("status", "empty");
        return response;
    }
}
