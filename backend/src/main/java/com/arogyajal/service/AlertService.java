package com.arogyajal.service;

import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorReading;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.repository.AlertRepository;
import com.arogyajal.repository.SymptomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

//import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class AlertService {
    
    private static final Logger log = LoggerFactory.getLogger(AlertService.class);
    
    private final AlertRepository alertRepository;
    private final SymptomRepository symptomRepository;
    private final SymptomClusterService clusterService;
    private final RestTemplate restTemplate;
    
    @Value("${n8n.webhook.url}")
    private String n8nWebhookUrl;
    
    @Value("${n8n.webhook.enabled:true}")
    private boolean n8nWebhookEnabled;
    
    @Value("${n8n.webhook.timeout:5000}")
    private int n8nWebhookTimeout;
    
    @Value("${n8n.webhook.min-severity:LOW}")
    private String n8nMinSeverity;

    public AlertService(AlertRepository alertRepository, SymptomRepository symptomRepository,
                       SymptomClusterService clusterService, RestTemplate restTemplate) {
        this.alertRepository = alertRepository;
        this.symptomRepository = symptomRepository;
        this.clusterService = clusterService;
        this.restTemplate = restTemplate;
    }
    
    public Alert createAlert(Alert alert) {
        log.info("Creating alert: {}", alert.getTitle());
        alert.setTriggeredAt(com.google.cloud.Timestamp.now());
        alert.setStatus("ACTIVE");
        // Generate a unique ID for the alert
        String alertId = UUID.randomUUID().toString();
        alert.setId(alertId); // Set ID before saving
        try {
            Alert savedAlert = alertRepository.save(alert, alertId);
            
            // Send alert to n8n webhook asynchronously (non-blocking)
            // Pass individual fields to avoid async proxy issues
            sendAlertToN8N(alertId, alert.getSeverity(), alert.getLocation(), alert.getDescription(), alert.getTitle());
            
            return savedAlert;
        } catch (Exception e) {
            log.error("Error creating alert", e);
            throw new RuntimeException("Failed to create alert", e);
        }
    }
    
    /**
     * Send alert to n8n webhook for workflow automation
     * This method is async to prevent blocking the main alert creation flow
     * Accepts individual fields to avoid async proxy issues with Alert object
     */
    @Async
    public void sendAlertToN8N(String alertId, String severity, String location, String description, String title) {
        if (!n8nWebhookEnabled) {
            log.debug("n8n webhook is disabled, skipping alert notification");
            return;
        }
        
        if (n8nWebhookUrl == null || n8nWebhookUrl.contains("your-n8n-instance")) {
            log.debug("n8n webhook URL not configured, skipping alert notification");
            return;
        }
        
        // Filter by minimum severity level
        if (!shouldSendToN8NSeverity(severity)) {
            log.debug("Skipping n8n notification for {} severity alert: {} (min severity: {})", 
                     severity, alertId, n8nMinSeverity);
            return;
        }
        
        try {
            // Log alert details for debugging
            log.debug("Alert details - ID: {}, Severity: {}, Location: {}, Description: {}", 
                     alertId, severity, location, description);
            
            // Build message
            String message = description != null && !description.isEmpty() 
                ? description 
                : buildAlertMessageFromFields(severity, title, location);
            
            // Build JSON payload in exact format required by n8n
            Map<String, Object> payload = new HashMap<>();
            payload.put("alertId", alertId != null ? alertId : "UNKNOWN");
            payload.put("severity", mapSeverityToN8N(severity));
            payload.put("location", location != null ? location : "Unknown Location");
            payload.put("message", message);
            
            // Log payload before sending
            log.info("n8n Payload: alertId={}, severity={}, location={}, message={}", 
                    payload.get("alertId"), payload.get("severity"), 
                    payload.get("location"), payload.get("message"));
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create request entity
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            // Send POST request to n8n webhook
            log.info("Sending alert {} to n8n webhook: {}", alertId, n8nWebhookUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(n8nWebhookUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Successfully sent alert {} to n8n webhook", alertId);
            } else {
                log.warn("⚠️ n8n webhook returned non-success status: {} for alert {}", 
                        response.getStatusCode(), alertId);
            }
            
        } catch (Exception e) {
            // Log error but don't fail the alert creation
            log.error("❌ Failed to send alert {} to n8n webhook: {}", alertId, e.getMessage());
            log.debug("n8n webhook error details", e);
        }
    }
    
    /**
     * Check if alert should be sent to n8n based on severity threshold (for individual severity)
     */
    private boolean shouldSendToN8NSeverity(String severity) {
        if (severity == null) {
            return true; // Send alerts with no severity
        }
        
        // Severity hierarchy: LOW < MEDIUM < HIGH < CRITICAL
        Map<String, Integer> severityLevels = Map.of(
            "LOW", 1,
            "MILD", 1,
            "MEDIUM", 2,
            "MODERATE", 2,
            "HIGH", 3,
            "CRITICAL", 4
        );
        
        int alertLevel = severityLevels.getOrDefault(severity.toUpperCase(), 1);
        int minLevel = severityLevels.getOrDefault(n8nMinSeverity.toUpperCase(), 1);
        
        return alertLevel >= minLevel;
    }
    
    /**
     * Build alert message from individual fields
     */
    private String buildAlertMessageFromFields(String severity, String title, String location) {
        StringBuilder message = new StringBuilder();
        
        if (severity != null) {
            message.append(mapSeverityToN8N(severity)).append(" severity ");
        }
        
        if (title != null) {
            message.append(title);
        } else {
            message.append("alert");
        }
        
        if (location != null) {
            message.append(" at ").append(location);
        }
        
        return message.toString();
    }
    
    /**
     * Check if alert should be sent to n8n based on severity threshold
     */
    private boolean shouldSendToN8N(Alert alert) {
        if (alert.getSeverity() == null) {
            return true; // Send alerts with no severity
        }
        
        // Severity hierarchy: LOW < MEDIUM < HIGH < CRITICAL
        Map<String, Integer> severityLevels = Map.of(
            "LOW", 1,
            "MILD", 1,
            "MEDIUM", 2,
            "MODERATE", 2,
            "HIGH", 3,
            "CRITICAL", 4
        );
        
        int alertLevel = severityLevels.getOrDefault(alert.getSeverity().toUpperCase(), 1);
        int minLevel = severityLevels.getOrDefault(n8nMinSeverity.toUpperCase(), 1);
        
        return alertLevel >= minLevel;
    }
    
    /**
     * Map internal severity levels to n8n format (lowercase)
     */
    private String mapSeverityToN8N(String severity) {
        if (severity == null) {
            return "medium";
        }
        
        switch (severity.toUpperCase()) {
            case "CRITICAL":
                return "critical";
            case "HIGH":
                return "high";
            case "MEDIUM":
            case "MODERATE":
                return "medium";
            case "LOW":
            case "MILD":
                return "low";
            default:
                return "medium";
        }
    }
    
    /**
     * Build a descriptive message for the alert
     */
    private String buildAlertMessage(Alert alert) {
        if (alert.getDescription() != null && !alert.getDescription().isEmpty()) {
            return alert.getDescription();
        }
        
        // Fallback: construct message from alert details
        StringBuilder message = new StringBuilder();
        
        if (alert.getSeverity() != null) {
            message.append(mapSeverityToN8N(alert.getSeverity()))
                   .append(" severity ");
        }
        
        if (alert.getAlertType() != null) {
            message.append(alert.getAlertType().toLowerCase().replace("_", " "))
                   .append(" alert: ");
        } else {
            message.append("alert: ");
        }
        
        if (alert.getTitle() != null) {
            message.append(alert.getTitle());
        } else {
            message.append("Alert triggered");
        }
        
        if (alert.getLocation() != null) {
            message.append(" at ").append(alert.getLocation());
        }
        
        return message.toString();
    }
    
    public List<Alert> getAllAlerts() {
        log.info("Retrieving all alerts");
        try {
            return alertRepository.findAll();
        } catch (Exception e) {
            log.error("Error retrieving all alerts", e);
            throw new RuntimeException("Failed to retrieve alerts", e);
        }
    }
    
    public Optional<Alert> getAlertById(String id) {
        log.info("Retrieving alert by ID: {}", id);
        try {
            return alertRepository.findById(id);
        } catch (Exception e) {
            log.error("Error retrieving alert with ID: " + id, e);
            throw new RuntimeException("Failed to retrieve alert", e);
        }
    }
    
    public List<Alert> getAlertsByStatus(String status) {
        log.info("Retrieving alerts with status: {}", status);
        try {
            return alertRepository.findByStatus(status);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error retrieving alerts with status: " + status, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            throw new RuntimeException("Failed to retrieve alerts by status", e);
        }
    }
    
    public List<Alert> getAlertsBySeverity(String severity) {
        log.info("Retrieving alerts with severity: {}", severity);
        try {
            return alertRepository.findBySeverity(severity);
        } catch (ExecutionException e) {
            // Check if it's a Firestore index error
            if (e.getCause() != null && e.getCause().getMessage() != null 
                && e.getCause().getMessage().contains("requires an index")) {
                log.warn("Firestore index not created for severity query. Using fallback query without ordering.");
                try {
                    // Fallback: Get all alerts and filter in memory
                    List<Alert> allAlerts = alertRepository.findAll();
                    return allAlerts.stream()
                        .filter(a -> severity.equals(a.getSeverity()))
                        .sorted((a, b) -> {
                            if (a.getTriggeredAt() == null) return 1;
                            if (b.getTriggeredAt() == null) return -1;
                            return b.getTriggeredAt().compareTo(a.getTriggeredAt());
                        })
                        .toList();
                } catch (Exception fallbackError) {
                    log.error("Fallback query also failed", fallbackError);
                    return new ArrayList<>();
                }
            }
            log.error("Error retrieving alerts with severity: " + severity, e);
            return new ArrayList<>();
        } catch (InterruptedException e) {
            log.error("Error retrieving alerts with severity: " + severity, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Unexpected error retrieving alerts with severity: " + severity, e);
            return new ArrayList<>();
        }
    }
    
    public List<Alert> getAlertsByLocation(String location) {
        log.info("Retrieving alerts for location: {}", location);
        try {
            return alertRepository.findByLocation(location);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error retrieving alerts for location: " + location, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return Collections.emptyList();
        }
    }
    
    public List<Alert> getActiveAlerts() {
        log.info("Retrieving active alerts");
        try {
            return alertRepository.findByStatus("ACTIVE");
        } catch (ExecutionException e) {
            // Check if it's a Firestore index error
            if (e.getCause() != null && e.getCause().getMessage() != null 
                && e.getCause().getMessage().contains("requires an index")) {
                log.warn("Firestore index not created for active alerts query. Returning empty list.");
                log.warn("Create index at: https://console.firebase.google.com/project/arogyajal-40ddd/firestore/indexes");
                return Collections.emptyList();
            }
            log.error("Error retrieving active alerts", e);
            return Collections.emptyList();
        } catch (InterruptedException e) {
            log.error("Error retrieving active alerts", e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return Collections.emptyList();
        }
    }

    public List<Alert> getCriticalAlerts() {
        log.info("Retrieving critical alerts");
        try {
            return getAlertsBySeverity("CRITICAL");
        } catch (Exception e) {
            log.error("Error retrieving critical alerts, returning empty list", e);
            return new ArrayList<>();
        }
    }

    public Alert acknowledgeAlert(String id, String userId) {
        log.info("Acknowledging alert {} by user {}", id, userId);
        try {
            Optional<Alert> alertOpt = alertRepository.findById(id);
            if (alertOpt.isPresent()) {
                Alert alert = alertOpt.get();
                alert.setStatus("ACKNOWLEDGED");
                alert.setAcknowledgedAt(com.google.cloud.Timestamp.now());
                if (alert.getNotifiedUsers() == null) {
                    alert.setNotifiedUsers(new ArrayList<>());
                }
                if (!alert.getNotifiedUsers().contains(userId)) {
                    alert.getNotifiedUsers().add(userId);
                }
                return alertRepository.save(alert, id);
            }
            throw new RuntimeException("Alert not found with id: " + id);
        } catch (Exception e) {
            log.error("Error acknowledging alert: " + id, e);
            throw new RuntimeException("Failed to acknowledge alert", e);
        }
    }

    public Alert resolveAlert(String id, String resolvedBy, String resolutionNotes) {
        log.info("Resolving alert {} by user {}", id, resolvedBy);
        try {
            Optional<Alert> alertOpt = alertRepository.findById(id);
            if (alertOpt.isPresent()) {
                Alert alert = alertOpt.get();
                alert.setStatus("RESOLVED");
                alert.setResolvedAt(com.google.cloud.Timestamp.now());
                alert.setResolvedBy(resolvedBy);
                alert.setResolutionNotes(resolutionNotes);
                return alertRepository.save(alert, id);
            }
            throw new RuntimeException("Alert not found with id: " + id);
        } catch (Exception e) {
            log.error("Error resolving alert: " + id, e);
            throw new RuntimeException("Failed to resolve alert", e);
        }
    }

    public void deleteAlert(String id) {
        log.info("Deleting alert: {}", id);
        try {
            alertRepository.deleteById(id);
            log.info("Alert {} deleted successfully", id);
        } catch (Exception e) {
            log.error("Error deleting alert: " + id, e);
            throw new RuntimeException("Failed to delete alert", e);
        }
    }

    public void checkForWaterQualityAlerts(SensorReading reading) {
        log.info("Checking for water quality alerts for sensor: {}", reading.getSensorId());
        try {
            // Check pH levels (ideal: 6.5-8.5)
            if (reading.getPh() != null && (reading.getPh() < 6.5 || reading.getPh() > 8.5)) {
                createAlert(createWaterQualityAlert(reading, "pH", reading.getPh()));
            }

            // Check turbidity (ideal: < 5 NTU)
            if (reading.getTurbidity() != null && reading.getTurbidity() > 5.0) {
                createAlert(createWaterQualityAlert(reading, "Turbidity", reading.getTurbidity()));
            }

            // Check conductivity (ideal: < 1000 µS/cm)
            if (reading.getConductivity() != null && reading.getConductivity() > 1000) {
                createAlert(createWaterQualityAlert(reading, "Conductivity", reading.getConductivity()));
            }
            
            // Check TDS (ideal: < 500 ppm)
            if (reading.getTotalDissolvedSolids() != null && reading.getTotalDissolvedSolids() > 500) {
                createAlert(createWaterQualityAlert(reading, "TDS", reading.getTotalDissolvedSolids()));
            }
            
            // DO sensor not available - alert disabled
            
            // Check temperature (ideal: < 30°C)
            if (reading.getTemperature() != null && reading.getTemperature() > 30) {
                createAlert(createWaterQualityAlert(reading, "Temperature", reading.getTemperature()));
            }
        } catch (Exception e) {
            log.error("Error checking for water quality alerts", e);
        }
    }

    public void checkForSymptomClusterAlerts(String location) {
        log.info("Checking for symptom cluster alerts in location: {}", location);
        com.google.cloud.Timestamp now = com.google.cloud.Timestamp.now();
        com.google.cloud.Timestamp last24Hours = com.google.cloud.Timestamp.ofTimeSecondsAndNanos(
            now.getSeconds() - (24 * 3600), 0);
        
        // FIXED: Now using Timestamp instead of LocalDateTime
        List<SymptomReport> recentReports = symptomRepository
                .findByLocationAndReportedAtBetweenOrderByReportedAtDesc(location, last24Hours, now);
        
        if (recentReports.size() >= 5) {
            log.info("Symptom cluster detected in {}: {} reports in last 24 hours", location, recentReports.size());
            createSymptomClusterAlert(location, recentReports);
        }
    }

    /**
     * Check for symptom spike alerts (24-hour rise detection)
     * Compares current 24h report count with previous 24h period
     * Triggers alert if increase is significant (>50% rise or >10 new reports)
     */
    public void checkForSymptomSpikeAlerts(String location) {
        log.info("Checking for symptom spike alerts in location: {}", location);
        
        try {
            com.google.cloud.Timestamp now = com.google.cloud.Timestamp.now();
            com.google.cloud.Timestamp last24Hours = com.google.cloud.Timestamp.ofTimeSecondsAndNanos(
                now.getSeconds() - (24 * 3600), 0);
            com.google.cloud.Timestamp previous24Hours = com.google.cloud.Timestamp.ofTimeSecondsAndNanos(
                now.getSeconds() - (48 * 3600), 0);
            
            // Get current 24h reports
            List<SymptomReport> currentReports = symptomRepository
                    .findByLocationAndReportedAtBetweenOrderByReportedAtDesc(location, last24Hours, now);
            
            // Get previous 24h reports
            List<SymptomReport> previousReports = symptomRepository
                    .findByLocationAndReportedAtBetweenOrderByReportedAtDesc(location, previous24Hours, last24Hours);
            
            int currentCount = currentReports.size();
            int previousCount = previousReports.size();
            
            // Calculate increase
            int absoluteIncrease = currentCount - previousCount;
            double percentIncrease = previousCount > 0 ? 
                ((double) absoluteIncrease / previousCount) * 100 : 0;
            
            log.info("Symptom spike check - Location: {}, Current: {}, Previous: {}, Increase: {}%, Absolute: {}", 
                    location, currentCount, previousCount, String.format("%.1f", percentIncrease), absoluteIncrease);
            
            // Trigger alert if significant spike detected
            boolean significantSpike = (percentIncrease >= 50 && absoluteIncrease >= 3) || absoluteIncrease >= 10;
            
            if (significantSpike) {
                log.warn("⚠️ SYMPTOM SPIKE DETECTED in {}: {}% increase ({} new reports)", 
                        location, String.format("%.1f", percentIncrease), absoluteIncrease);
                createSymptomSpikeAlert(location, currentCount, previousCount, percentIncrease, currentReports);
            } else {
                log.info("✅ No significant symptom spike in {}", location);
            }
            
        } catch (Exception e) {
            log.error("Error checking for symptom spike alerts: {}", e.getMessage(), e);
        }
    }

    /**
     * Create symptom spike alert
     */
    private void createSymptomSpikeAlert(String location, int currentCount, int previousCount, 
                                        double percentIncrease, List<SymptomReport> reports) {
        try {
            // Determine severity based on spike magnitude
            String severity;
            if (percentIncrease >= 100 || currentCount >= 20) {
                severity = "CRITICAL";
            } else if (percentIncrease >= 75 || currentCount >= 15) {
                severity = "HIGH";
            } else {
                severity = "MEDIUM";
            }
            
            String title = String.format("Symptom Spike Alert - %s", location);
            String description = String.format(
                "Significant increase in symptom reports detected in %s. " +
                "Current 24h: %d reports (up from %d, %.1f%% increase). " +
                "Immediate investigation recommended.",
                location, currentCount, previousCount, percentIncrease
            );
            
            // Create alert
            Alert alert = Alert.builder()
                    .alertType("SYMPTOM_SPIKE")
                    .severity(severity)
                    .title(title)
                    .description(description)
                    .location(location)
                    .relatedSymptomReportIds(reports.stream().map(SymptomReport::getId).toList())
                    .build();
            
            createAlert(alert);
            log.info("🚨 Created symptom spike alert for {}: {} severity", location, severity);
            
        } catch (Exception e) {
            log.error("Error creating symptom spike alert: {}", e.getMessage(), e);
        }
    }

    private Alert createWaterQualityAlert(SensorReading reading, String parameter, double value) {
        try {
            String severity = getSeverityForParameter(parameter, value);
            String title = String.format("%s %s Alert - %s",
                    parameter,
                    severity,
                    reading.getLocation() != null ? reading.getLocation() : "Unknown Location");

            String description = String.format("%s value of %.2f is outside the normal range at %s",
                    parameter,
                    value,
                    reading.getLocation() != null ? reading.getLocation() : "an unknown location");

            Alert alert = new Alert();
            alert.setAlertType("WATER_QUALITY");
            alert.setSeverity(severity);
            alert.setTitle(title);
            alert.setDescription(description);
            alert.setLocation(reading.getLocation());
            alert.setSensorId(reading.getSensorId());
            alert.setParameter(parameter);
            alert.setActualValue(value);
            alert.setSensorReadingId(reading.getId());
            alert.setNotificationMethod("EMAIL"); // Default notification method

            return alert;
        } catch (Exception e) {
            log.error("Error creating water quality alert", e);
            throw new RuntimeException("Failed to create water quality alert", e);
        }
    }

    private void createSymptomClusterAlert(String location, List<SymptomReport> reports) {
        // Create alert
        Alert alert = Alert.builder()
                .alertType("SYMPTOM_CLUSTER")
                .severity("HIGH")
                .title("Symptom Cluster Alert")
                .description(String.format("High number of symptom reports (%d) in the last 24 hours in %s",
                        reports.size(), location))
                .location(location)
                .relatedSymptomReportIds(reports.stream().map(SymptomReport::getId).toList())
                .build();

        Alert createdAlert = createAlert(alert);
        
        // Create cluster object
        try {
            // Calculate severity based on report count and individual severities
            int severeCount = (int) reports.stream()
                .filter(r -> "SEVERE".equals(r.getSeverity()))
                .count();
            int moderateCount = (int) reports.stream()
                .filter(r -> "MODERATE".equals(r.getSeverity()))
                .count();
            
            String overallSeverity;
            if (severeCount >= 3 || reports.size() >= 10) {
                overallSeverity = "SEVERE";
            } else if (severeCount >= 1 || reports.size() >= 7) {
                overallSeverity = "MODERATE";
            } else {
                overallSeverity = "MILD";
            }
            
            // Calculate cluster score
            double clusterScore = (reports.size() * 10) + (severeCount * 5) + (moderateCount * 2);
            
            // Build cluster object with ALL required fields
            com.arogyajal.model.SymptomCluster cluster = com.arogyajal.model.SymptomCluster.builder()
                    .location(location)
                    .reportCount(reports.size())
                    .reportIds(reports.stream().map(SymptomReport::getId).toList())
                    .status("ACTIVE")
                    .overallSeverity(overallSeverity)
                    .detectionMethod("HYBRID")  // Changed from AUTOMATIC to HYBRID (valid option)
                    .alertId(createdAlert.getId())
                    .clusterScore(clusterScore)
                    .alertGenerated(true)
                    .detectedAt(com.google.cloud.Timestamp.now())
                    .build();
            
            clusterService.createCluster(cluster);
            log.info("Created cluster object for location: {} with {} reports", location, reports.size());
            
        } catch (Exception e) {
            log.error("Error creating cluster object: {}", e.getMessage(), e);
            // Don't fail alert creation if cluster creation fails
        }
    }

    public String getSeverityForParameter(String parameter, double value) {
        try {
            // Threshold-based severity calculation
            switch (parameter) {
                case "pH":
                    if (value < 4.0 || value > 10.0) return "CRITICAL";
                    if (value < 5.0 || value > 9.0) return "HIGH";
                    if (value < 6.5 || value > 8.5) return "MEDIUM";
                    return "LOW";

                case "Turbidity":
                    if (value > 10.0) return "CRITICAL";
                    if (value > 7.0) return "HIGH";
                    if (value > 5.0) return "MEDIUM";
                    return "LOW";

                case "Conductivity":
                    if (value > 2000) return "CRITICAL";
                    if (value > 1500) return "HIGH";
                    if (value > 1000) return "MEDIUM";
                    return "LOW";
                    
                case "TDS":
                    if (value > 1000) return "CRITICAL";
                    if (value > 750) return "HIGH";
                    if (value > 500) return "MEDIUM";
                    return "LOW";
                    
                case "Dissolved Oxygen":
                    if (value < 3.0) return "CRITICAL";
                    if (value < 4.0) return "HIGH";
                    if (value < 5.0) return "MEDIUM";
                    return "LOW";
                    
                case "Temperature":
                    if (value > 35) return "CRITICAL";
                    if (value > 32) return "HIGH";
                    if (value > 30) return "MEDIUM";
                    return "LOW";

                default:
                    return "MEDIUM";
            }
        } catch (Exception e) {
            log.error("Error determining severity for parameter: " + parameter, e);
            return "MEDIUM"; // Default to medium severity in case of errors
        }
    }

    public long getAlertCount() {
        try {
            return alertRepository.count();
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error getting alert count", e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return 0;
        }
    }

    public long getAlertCountByStatus(String status) {
        try {
            return alertRepository.countByStatus(status);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error getting alert count by status: " + status, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return 0;
        }
    }

    public long getAlertCountBySeverity(String severity) {
        try {
            return alertRepository.countBySeverity(severity);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error getting alert count by severity: " + severity, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return 0;
        }
    }
    
    public List<Alert> getAlertsByState(String state) {
        log.info("Retrieving alerts for state: {}", state);
        try {
            return alertRepository.findAll().stream()
                .filter(alert -> alert.getLocation() != null && 
                        alert.getLocation().toLowerCase().contains(state.toLowerCase()))
                .sorted((a, b) -> {
                    if (a.getTriggeredAt() == null) return 1;
                    if (b.getTriggeredAt() == null) return -1;
                    return b.getTriggeredAt().compareTo(a.getTriggeredAt());
                })
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving alerts for state: " + state, e);
            return new ArrayList<>();
        }
    }
    
    public List<Alert> getAlertsByType(String type) {
        log.info("Retrieving alerts of type: {}", type);
        try {
            return alertRepository.findAll().stream()
                .filter(alert -> type.equalsIgnoreCase(alert.getAlertType()))
                .sorted((a, b) -> {
                    if (a.getTriggeredAt() == null) return 1;
                    if (b.getTriggeredAt() == null) return -1;
                    return b.getTriggeredAt().compareTo(a.getTriggeredAt());
                })
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving alerts of type: " + type, e);
            return new ArrayList<>();
        }
    }
    
    public int bulkAcknowledgeAlerts(List<String> alertIds, String userId) {
        log.info("Bulk acknowledging {} alerts by user {}", alertIds.size(), userId);
        int successCount = 0;
        for (String alertId : alertIds) {
            try {
                acknowledgeAlert(alertId, userId);
                successCount++;
            } catch (Exception e) {
                log.error("Error acknowledging alert {}: {}", alertId, e.getMessage());
            }
        }
        log.info("Bulk acknowledge complete: {}/{} successful", successCount, alertIds.size());
        return successCount;
    }
}
