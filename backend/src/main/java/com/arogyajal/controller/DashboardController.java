package com.arogyajal.controller;

import com.arogyajal.dto.DashboardResponse;
import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorReading;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.service.AlertService;
import com.arogyajal.service.SensorService;
import com.arogyajal.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import com.google.cloud.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDateTime;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081"}, 
           allowedHeaders = "*", 
           allowCredentials = "true")
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Controller", description = "APIs for dashboard data and analytics")
public class DashboardController {
    
    private static final Logger log = LoggerFactory.getLogger(DashboardController.class);
    
    private final SensorService sensorService;
    private final SymptomService symptomService;
    private final AlertService alertService;

    public DashboardController(SensorService sensorService, SymptomService symptomService, AlertService alertService) {
        this.sensorService = sensorService;
        this.symptomService = symptomService;
        this.alertService = alertService;
    }
    
    @GetMapping("/overview")
    @Operation(summary = "Get dashboard overview", description = "Retrieve overall dashboard metrics and status")
    public ResponseEntity<Object> getDashboardOverview() {
        log.info("Retrieving dashboard overview");
        try {
            // Initialize a simple response with default values
            DashboardResponse response = new DashboardResponse();
            response.setOverallStatus("HEALTHY");
            response.setLastUpdated(Timestamp.now().toString());
            
            // Set default values for all fields to avoid null pointers
            response.setTotalSensors(0);
            response.setActiveSensors(0);
            response.setOfflineSensors(0);
            response.setLatestReadings(new HashMap<>());
            response.setQualityAlerts(new ArrayList<>());
            response.setTotalSymptomReports(0);
            response.setPendingReports(0);
            response.setResolvedReports(0);
            response.setRecentSymptoms(new ArrayList<>());
            response.setTotalAlerts(0);
            response.setActiveAlerts(0);
            response.setCriticalAlerts(0);
            response.setRecentAlerts(new ArrayList<>());
            response.setQualityTrends(new HashMap<>());
            response.setQualityStatus(new HashMap<>());
            response.setLocationData(new HashMap<>());
            
            log.info("Sending default dashboard response");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in getDashboardOverview: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to generate dashboard overview");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/sensors/status")
    @Operation(summary = "Get sensor status summary", description = "Retrieve sensor status and health information")
    public ResponseEntity<Object> getSensorStatus() {
        log.info("Retrieving sensor status");
        
        List<String> distinctSensorIds = sensorService.getDistinctSensorIds();
        List<String> distinctLocations = sensorService.getDistinctLocations();
        
        // Get latest readings for each sensor to determine status
        Map<String, String> sensorStatus = new HashMap<>();
        for (String sensorId : distinctSensorIds) {
            Optional<SensorReading> latest = sensorService.getLatestReadingBySensorId(sensorId);
            if (latest.isPresent()) {
                Timestamp lastReading = latest.get().getTimestamp();
                Timestamp oneHourAgo = Timestamp.ofTimeSecondsAndNanos(
                    Timestamp.now().getSeconds() - 3600, 0);
                if (lastReading.compareTo(oneHourAgo) > 0) {
                    sensorStatus.put(sensorId, "ONLINE");
                } else {
                    sensorStatus.put(sensorId, "OFFLINE");
                }
            } else {
                sensorStatus.put(sensorId, "OFFLINE");
            }
        }
        
        long onlineSensors = sensorStatus.values().stream().mapToLong(status -> "ONLINE".equals(status) ? 1 : 0).sum();
        long offlineSensors = sensorStatus.size() - onlineSensors;
        
        SensorStatusResponse response = new SensorStatusResponse();
        response.setTotalSensors(distinctSensorIds.size());
        response.setOnlineSensors(onlineSensors);
        response.setOfflineSensors(offlineSensors);
        response.setSensorStatusMap(sensorStatus);
        response.setTotalLocations(distinctLocations.size());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/alerts/summary")
    @Operation(summary = "Get alerts summary", description = "Retrieve summary of all alerts")
    public ResponseEntity<Object> getAlertsSummary() {
        log.info("Retrieving alerts summary");
        
        List<Alert> allAlerts = alertService.getAllAlerts();
        List<Alert> activeAlerts = alertService.getActiveAlerts();
        List<Alert> criticalAlerts = alertService.getCriticalAlerts();
        
        AlertsSummaryResponse response = new AlertsSummaryResponse();
        response.totalAlerts = allAlerts.size();
        response.activeAlerts = activeAlerts.size();
        response.criticalAlerts = criticalAlerts.size();
        response.recentAlerts = allAlerts.stream()
                .sorted((a, b) -> b.getTriggeredAt().compareTo(a.getTriggeredAt()))
                .limit(10)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/symptoms/summary")
    @Operation(summary = "Get symptoms summary", description = "Retrieve summary of symptom reports")
    public ResponseEntity<Object> getSymptomsSummary() {
        log.info("Retrieving symptoms summary");
        
        long totalReports = symptomService.getReportCount();
        long pendingReports = symptomService.getReportCountByStatus("PENDING");
        long resolvedReports = symptomService.getReportCountByStatus("RESOLVED");
        
        // Get recent high severity reports
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<SymptomReport> recentHighSeverity = symptomService.getHighSeverityRecentReports(last24Hours);
        
        SymptomsSummaryResponse response = new SymptomsSummaryResponse();
        response.totalReports = totalReports;
        response.pendingReports = pendingReports;
        response.resolvedReports = resolvedReports;
        response.recentHighSeverityReports = recentHighSeverity.size();
        response.recentReports = recentHighSeverity.stream()
                .limit(10)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/water-quality/trends")
    @Operation(summary = "Get water quality trends", description = "Retrieve water quality trends over time")
    public ResponseEntity<Object> getWaterQualityTrends(
            @RequestParam(defaultValue = "24") int hours) {
        log.info("Retrieving water quality trends for last {} hours", hours);
        
        Timestamp end = Timestamp.now();
        Timestamp start = Timestamp.ofTimeSecondsAndNanos(
            end.getSeconds() - (hours * 3600), 0);
        
        List<SensorReading> readings = sensorService.getReadingsByTimeRange(start, end);
        
        // Group readings by parameter and create trend data
        Map<String, List<DashboardResponse.DataPoint>> trends = new HashMap<>();
        Map<String, Double> latestValues = new HashMap<>();
        
        // Process each parameter
        String[] parameters = {"ph", "temperature", "turbidity", "dissolvedOxygen", "conductivity"};
        
        for (String param : parameters) {
            List<DashboardResponse.DataPoint> dataPoints = new ArrayList<>();
            Double latestValue = null;
            
            for (SensorReading reading : readings) {
                Double value = getParameterValue(reading, param);
                if (value != null) {
                    dataPoints.add(DashboardResponse.DataPoint.builder()
                            .timestamp(TimestampToLocalDateTime(reading.getTimestamp()))
                            .value(value)
                            .build());
                    latestValue = value;
                }
            }
            
            if (!dataPoints.isEmpty()) {
                trends.put(param, dataPoints);
                latestValues.put(param, latestValue);
            }
        }
        
        WaterQualityTrendsResponse response = new WaterQualityTrendsResponse();
        response.trends = trends;
        response.latestValues = latestValues;
        response.timeRange = hours + " hours";
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/locations/summary")
    @Operation(summary = "Get locations summary", description = "Retrieve summary data for all locations")
    public ResponseEntity<Object> getLocationsSummary() {
        log.info("Retrieving locations summary");
        
        List<String> distinctLocations = sensorService.getDistinctLocations();
        List<DashboardResponse.LocationSummary> locationSummaries = new ArrayList<>();
        
        // Filter out null locations and get distinct ones
        List<String> uniqueLocations = distinctLocations.stream()
                .filter(Objects::nonNull)  // Filter out null locations
                .distinct()
                .collect(Collectors.toList());
                
        for (String locationName : uniqueLocations) {
            if (locationName == null) continue;  // Skip null location names
            
            // Get sensor count for this location
            long sensorCount = sensorService.getSensorCountByLocation(locationName);
            
            // Get alert count for this location
            List<Alert> locationAlerts = alertService.getAlertsByLocation(locationName);
            
            // Get symptom report count for this location
            long symptomCount = symptomService.getReportCountByLocation(locationName);
            
            // Get latest readings for this location
            List<SensorReading> latestReadings = sensorService.getReadingsByLocation(locationName);
            Map<String, Double> latestValues = new HashMap<>();
            
            if (latestReadings != null && !latestReadings.isEmpty()) {
                SensorReading latest = latestReadings.get(0);
                if (latest != null) {
                    latestValues.put("ph", latest.getPh());
                    latestValues.put("temperature", latest.getTemperature());
                    latestValues.put("turbidity", latest.getTurbidity());
                    latestValues.put("dissolvedOxygen", latest.getDissolvedOxygen());
                }
            }
            
            // Determine overall status for this location
            String status = "HEALTHY";
            if (locationAlerts.stream().anyMatch(alert -> "CRITICAL".equals(alert.getSeverity()))) {
                status = "CRITICAL";
            } else if (locationAlerts.stream().anyMatch(alert -> "HIGH".equals(alert.getSeverity()))) {
                status = "WARNING";
            }
            
            locationSummaries.add(DashboardResponse.LocationSummary.builder()
                    .location(locationName)
                    .status(status)
                    .sensorCount((int) sensorCount)
                    .alertCount(locationAlerts.size())
                    .symptomReportCount((int) symptomCount)
                    .latestReadings(latestValues)
                    .build());
        }
        
        LocationsSummaryResponse response = new LocationsSummaryResponse();
        response.locations = locationSummaries;
        response.totalLocations = locationSummaries.size();
        
        return ResponseEntity.ok(response);
    }
    
    private Double getParameterValue(SensorReading reading, String parameter) {
        switch (parameter) {
            case "ph":
                return reading.getPh();
            case "temperature":
                return reading.getTemperature();
            case "turbidity":
                return reading.getTurbidity();
            case "dissolvedOxygen":
                return reading.getDissolvedOxygen();
            case "conductivity":
                return reading.getConductivity();
            default:
                return null;
        }
    }
    
    private LocalDateTime TimestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) return null;
        return LocalDateTime.ofEpochSecond(
            timestamp.getSeconds(),
            timestamp.getNanos(),
            ZoneId.systemDefault().getRules().getOffset(Instant.now())
        );
    }
    
    // Response classes
    public static class SensorStatusResponse {
        private long totalSensors;
        private long onlineSensors;
        private long offlineSensors;
        private Map<String, String> sensorStatusMap;
        private int totalLocations;
        
        // Getters and Setters
        public long getTotalSensors() {
            return totalSensors;
        }
        
        public void setTotalSensors(long totalSensors) {
            this.totalSensors = totalSensors;
        }
        
        public long getOnlineSensors() {
            return onlineSensors;
        }
        
        public void setOnlineSensors(long onlineSensors) {
            this.onlineSensors = onlineSensors;
        }
        
        public long getOfflineSensors() {
            return offlineSensors;
        }
        
        public void setOfflineSensors(long offlineSensors) {
            this.offlineSensors = offlineSensors;
        }
        
        public Map<String, String> getSensorStatusMap() {
            return sensorStatusMap;
        }
        
        public void setSensorStatusMap(Map<String, String> sensorStatusMap) {
            this.sensorStatusMap = sensorStatusMap;
        }
        
        public int getTotalLocations() {
            return totalLocations;
        }
        
        public void setTotalLocations(int totalLocations) {
            this.totalLocations = totalLocations;
        }
    }
    
    public static class AlertsSummaryResponse {
        public long totalAlerts;
        public long activeAlerts;
        public long criticalAlerts;
        public List<Alert> recentAlerts;
    }
    
    public static class SymptomsSummaryResponse {
        public long totalReports;
        public long pendingReports;
        public long resolvedReports;
        public long recentHighSeverityReports;
        public List<SymptomReport> recentReports;
    }
    
    public static class WaterQualityTrendsResponse {
        public Map<String, List<DashboardResponse.DataPoint>> trends;
        public Map<String, Double> latestValues;
        public String timeRange;
    }
    
    public static class LocationsSummaryResponse {
        public List<DashboardResponse.LocationSummary> locations;
        public int totalLocations;
    }
}
