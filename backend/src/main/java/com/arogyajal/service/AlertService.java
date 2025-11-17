package com.arogyajal.service;

import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorReading;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.repository.AlertRepository;
import com.arogyajal.repository.SymptomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

//import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class AlertService {
    
    private static final Logger log = LoggerFactory.getLogger(AlertService.class);
    
    private final AlertRepository alertRepository;
    private final SymptomRepository symptomRepository;
    private final SymptomClusterService clusterService;

    public AlertService(AlertRepository alertRepository, SymptomRepository symptomRepository,
                       SymptomClusterService clusterService) {
        this.alertRepository = alertRepository;
        this.symptomRepository = symptomRepository;
        this.clusterService = clusterService;
    }
    
    public Alert createAlert(Alert alert) {
        log.info("Creating alert: {}", alert.getTitle());
        alert.setTriggeredAt(com.google.cloud.Timestamp.now());
        alert.setStatus("ACTIVE");
        // Generate a unique ID for the alert
        String alertId = UUID.randomUUID().toString();
        try {
            return alertRepository.save(alert, alertId);
        } catch (Exception e) {
            log.error("Error creating alert", e);
            throw new RuntimeException("Failed to create alert", e);
        }
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
            
            // Check dissolved oxygen (ideal: > 5 mg/L)
            if (reading.getDissolvedOxygen() != null && reading.getDissolvedOxygen() < 5.0) {
                createAlert(createWaterQualityAlert(reading, "Dissolved Oxygen", reading.getDissolvedOxygen()));
            }
            
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
                    .detectionMethod("AUTOMATIC")
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

    private String getSeverityForParameter(String parameter, double value) {
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
}
