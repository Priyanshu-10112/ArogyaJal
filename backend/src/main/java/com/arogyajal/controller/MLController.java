package com.arogyajal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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
    
    public MLController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Get symptom clusters from ML service
     * Fetches symptom reports from database and sends to ML service for clustering
     */
    @GetMapping("/symptom-clusters")
    @Operation(summary = "Get symptom clusters", description = "Retrieve symptom clustering analysis from ML service")
    public ResponseEntity<Map<String, Object>> getSymptomClusters() {
        log.info("Fetching symptom clusters from ML service");
        
        try {
            // First check if ML service is available
            String healthUrl = mlServiceUrl + "/health";
            try {
                restTemplate.getForEntity(healthUrl, Map.class);
            } catch (Exception e) {
                log.warn("ML service not available, returning empty response");
                return ResponseEntity.ok(createEmptyClusterResponse());
            }
            
            // ML service is available, but we need symptom data to cluster
            // For now, return empty response with proper message
            // TODO: Fetch symptom reports from database and send to ML service
            log.info("ML service available but clustering requires symptom report data");
            return ResponseEntity.ok(createEmptyClusterResponse());
            
        } catch (Exception e) {
            log.error("Error fetching symptom clusters from ML service", e);
            return ResponseEntity.ok(createEmptyClusterResponse());
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
            
            // ML service is available but needs data
            // TODO: Fetch clusters, water tests, and reports from database
            log.info("ML service available but prediction requires historical data");
            return ResponseEntity.ok(createEmptyOutbreakResponse());
            
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
