package com.arogyajal.service;

import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorReading;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.repository.AlertRepository;
import com.arogyajal.repository.SymptomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class AlertService {
    
    private static final Logger log = LoggerFactory.getLogger(AlertService.class);
    
    private final AlertRepository alertRepository;
    private final SymptomRepository symptomRepository;

    public AlertService(AlertRepository alertRepository, SymptomRepository symptomRepository) {
        this.alertRepository = alertRepository;
        this.symptomRepository = symptomRepository;
    }
    
    public Alert createAlert(Alert alert) {
        log.info("Creating alert: {}", alert.getTitle());
        alert.setTriggeredAt(LocalDateTime.now());
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
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error retrieving alerts with severity: " + severity, e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            throw new RuntimeException("Failed to retrieve alerts by severity", e);
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
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error retrieving active alerts", e);
            Thread.currentThread().interrupt(); // Restore the interrupted status
            return Collections.emptyList();
        }
    }

    public List<Alert> getCriticalAlerts() {
        log.info("Retrieving critical alerts");
        return getAlertsBySeverity("CRITICAL");
    }

    public Alert acknowledgeAlert(String id, String userId) {
        log.info("Acknowledging alert {} by user {}", id, userId);
        try {
            Optional<Alert> alertOpt = alertRepository.findById(id);
            if (alertOpt.isPresent()) {
                Alert alert = alertOpt.get();
                alert.setStatus("ACKNOWLEDGED");
                alert.setAcknowledgedAt(LocalDateTime.now());
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
                alert.setResolvedAt(LocalDateTime.now());
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
            // Check for critical water quality parameters
            if (reading.getPh() < 6.5 || reading.getPh() > 8.5) {
                createAlert(createWaterQualityAlert(reading, "pH", reading.getPh()));
            }

            if (reading.getTurbidity() > 5.0) { // NTU
                createAlert(createWaterQualityAlert(reading, "Turbidity", reading.getTurbidity()));
            }

            if (reading.getConductivity() > 1000) { // µS/cm
                createAlert(createWaterQualityAlert(reading, "Conductivity", reading.getConductivity()));
            }
        } catch (Exception e) {
            log.error("Error checking for water quality alerts", e);
        }
    }

    public void checkForSymptomClusterAlerts(String location) {
        log.info("Checking for symptom cluster alerts in location: {}", location);
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<SymptomReport> recentReports = symptomRepository
                .findByLocationAndReportedAtBetweenOrderByReportedAtDesc(location, last24Hours, LocalDateTime.now());
        if (recentReports.size() >= 5) {
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
        Alert alert = Alert.builder()
                .alertType("SYMPTOM_CLUSTER")
                .severity("HIGH")
                .title("Symptom Cluster Alert")
                .description(String.format("High number of symptom reports (%d) in the last 24 hours in %s",
                        reports.size(), location))
                .location(location)
                .relatedSymptomReportIds(reports.stream().map(SymptomReport::getId).toList())
                .build();

        createAlert(alert);
    }

    private String getSeverityForParameter(String parameter, double value) {
        try {
            // Simple threshold-based severity calculation
            // This can be enhanced with more sophisticated logic
            switch (parameter) {
                case "pH":
                    if (value < 4.0 || value > 10.0) return "CRITICAL";
                    if (value < 5.0 || value > 9.0) return "HIGH";
                    return "MEDIUM";

                case "Turbidity":
                    if (value > 10.0) return "CRITICAL";
                    if (value > 5.0) return "HIGH";
                    return "MEDIUM";

                case "Conductivity":
                    if (value > 2000) return "CRITICAL";
                    if (value > 1000) return "HIGH";
                    return "MEDIUM";

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
