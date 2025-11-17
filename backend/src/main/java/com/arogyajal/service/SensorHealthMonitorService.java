package com.arogyajal.service;

import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorHealth;
import com.arogyajal.model.SensorReading;
import com.arogyajal.repository.SensorHealthRepository;
import com.google.cloud.Timestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

/**
 * Service to monitor sensor health and detect faulty sensors
 * Tracks consecutive insufficient data submissions and generates alerts
 */
@Service
public class SensorHealthMonitorService {
    
    private static final Logger log = LoggerFactory.getLogger(SensorHealthMonitorService.class);
    
    // Threshold for consecutive insufficient data warnings
    private static final int WARNING_THRESHOLD = 3;  // 3 consecutive insufficient data
    private static final int CRITICAL_THRESHOLD = 6; // 6 consecutive insufficient data
    
    // Store recent data quality for each sensor (deviceId -> queue of data quality)
    private final Map<String, Queue<Boolean>> sensorHealthHistory = new HashMap<>();
    
    // Store sensor status (deviceId -> status)
    private final Map<String, String> sensorStatus = new HashMap<>();
    
    // Store total readings count
    private final Map<String, Integer> totalReadingsCount = new HashMap<>();
    private final Map<String, Integer> sufficientReadingsCount = new HashMap<>();
    
    private final AlertService alertService;
    private final SensorHealthRepository sensorHealthRepository;
    
    public SensorHealthMonitorService(AlertService alertService, SensorHealthRepository sensorHealthRepository) {
        this.alertService = alertService;
        this.sensorHealthRepository = sensorHealthRepository;
    }
    
    /**
     * Check sensor health based on data quality
     * @param deviceId Device ID
     * @param hasSufficientData Whether the data has sufficient sensors (3+)
     * @param reading The sensor reading
     */
    public void checkSensorHealth(String deviceId, boolean hasSufficientData, SensorReading reading) {
        try {
            // Initialize history for new sensor
            if (!sensorHealthHistory.containsKey(deviceId)) {
                sensorHealthHistory.put(deviceId, new LinkedList<>());
                sensorStatus.put(deviceId, "HEALTHY");
            }
            
            Queue<Boolean> history = sensorHealthHistory.get(deviceId);
            
            // Add current data quality to history
            history.offer(hasSufficientData);
            
            // Keep only last 10 readings
            if (history.size() > 10) {
                history.poll();
            }
            
            // Count consecutive insufficient data
            int consecutiveInsufficient = 0;
            for (Boolean sufficient : history) {
                if (!sufficient) {
                    consecutiveInsufficient++;
                } else {
                    consecutiveInsufficient = 0; // Reset on good data
                }
            }
            
            String currentStatus = sensorStatus.get(deviceId);
            String newStatus = currentStatus;
            
            // Determine sensor status
            if (consecutiveInsufficient >= CRITICAL_THRESHOLD) {
                newStatus = "FAULTY";
                if (!currentStatus.equals("FAULTY")) {
                    log.error("🚨 SENSOR FAULTY: {} - {} consecutive insufficient data submissions", 
                        deviceId, consecutiveInsufficient);
                    generateSensorFaultyAlert(deviceId, consecutiveInsufficient, reading);
                }
            } else if (consecutiveInsufficient >= WARNING_THRESHOLD) {
                newStatus = "DEGRADED";
                if (!currentStatus.equals("DEGRADED") && !currentStatus.equals("FAULTY")) {
                    log.warn("⚠️ SENSOR DEGRADED: {} - {} consecutive insufficient data submissions", 
                        deviceId, consecutiveInsufficient);
                    generateSensorWarningAlert(deviceId, consecutiveInsufficient, reading);
                }
            } else if (hasSufficientData && !currentStatus.equals("HEALTHY")) {
                // Sensor recovered
                newStatus = "HEALTHY";
                log.info("✅ SENSOR RECOVERED: {} - Now sending sufficient data", deviceId);
                generateSensorRecoveryAlert(deviceId, reading);
            }
            
            sensorStatus.put(deviceId, newStatus);
            
            // Update counters
            totalReadingsCount.put(deviceId, totalReadingsCount.getOrDefault(deviceId, 0) + 1);
            if (hasSufficientData) {
                sufficientReadingsCount.put(deviceId, sufficientReadingsCount.getOrDefault(deviceId, 0) + 1);
            }
            
            // Save to Firebase
            saveSensorHealthToFirebase(deviceId, newStatus, consecutiveInsufficient, reading);
            
        } catch (Exception e) {
            log.error("Error checking sensor health for {}: {}", deviceId, e.getMessage(), e);
        }
    }
    
    /**
     * Save sensor health to Firebase
     */
    private void saveSensorHealthToFirebase(String deviceId, String status, int consecutiveInsufficient, SensorReading reading) {
        try {
            SensorHealth health = new SensorHealth();
            health.setDeviceId(deviceId);
            health.setStatus(status);
            health.setConsecutiveInsufficient(consecutiveInsufficient);
            
            int total = totalReadingsCount.getOrDefault(deviceId, 0);
            int sufficient = sufficientReadingsCount.getOrDefault(deviceId, 0);
            int insufficient = total - sufficient;
            
            health.setTotalReadings(total);
            health.setSufficientReadings(sufficient);
            health.setInsufficientReadings(insufficient);
            health.setDataQualityPercentage(total > 0 ? (sufficient * 100.0 / total) : 0);
            health.setLastHealthCheck(Timestamp.now());
            
            if (consecutiveInsufficient == 0) {
                health.setLastGoodData(Timestamp.now());
            } else {
                health.setLastBadData(Timestamp.now());
            }
            
            health.setNotes(getStatusNotes(status, consecutiveInsufficient));
            
            sensorHealthRepository.save(health);
            
        } catch (Exception e) {
            log.error("Error saving sensor health to Firebase: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get status notes
     */
    private String getStatusNotes(String status, int consecutiveInsufficient) {
        switch (status) {
            case "HEALTHY":
                return "Sensor is functioning normally";
            case "DEGRADED":
                return String.format("Sensor has sent %d consecutive insufficient data readings. Check connections.", consecutiveInsufficient);
            case "FAULTY":
                return String.format("Sensor has sent %d consecutive insufficient data readings. Immediate maintenance required.", consecutiveInsufficient);
            default:
                return "Status unknown";
        }
    }
    
    /**
     * Get sensor health status
     */
    public String getSensorStatus(String deviceId) {
        return sensorStatus.getOrDefault(deviceId, "UNKNOWN");
    }
    
    /**
     * Get all sensor statuses
     */
    public Map<String, String> getAllSensorStatuses() {
        return new HashMap<>(sensorStatus);
    }
    
    /**
     * Get sensor health statistics
     */
    public Map<String, Object> getSensorHealthStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long healthyCount = sensorStatus.values().stream()
            .filter(status -> status.equals("HEALTHY")).count();
        long degradedCount = sensorStatus.values().stream()
            .filter(status -> status.equals("DEGRADED")).count();
        long faultyCount = sensorStatus.values().stream()
            .filter(status -> status.equals("FAULTY")).count();
        
        stats.put("totalSensors", sensorStatus.size());
        stats.put("healthySensors", healthyCount);
        stats.put("degradedSensors", degradedCount);
        stats.put("faultySensors", faultyCount);
        stats.put("sensorStatuses", sensorStatus);
        
        return stats;
    }
    
    /**
     * Generate alert for faulty sensor
     */
    private void generateSensorFaultyAlert(String deviceId, int consecutiveCount, SensorReading reading) {
        try {
            Alert alert = new Alert();
            alert.setAlertType("SENSOR_FAULT");
            alert.setSeverity("CRITICAL");
            alert.setTitle("Sensor Fault Detected - " + deviceId);
            alert.setDescription(String.format(
                "Sensor %s has sent insufficient data %d times consecutively. " +
                "Possible hardware failure or connectivity issue. Immediate maintenance required.",
                deviceId, consecutiveCount
            ));
            alert.setSensorId(deviceId);
            alert.setLocation(reading.getLocation());
            alert.setTriggeredAt(Timestamp.now());
            alert.setStatus("ACTIVE");
            alert.setNotificationMethod("EMAIL,SMS");
            
            alertService.createAlert(alert);
            log.info("Created FAULTY sensor alert for: {}", deviceId);
            
        } catch (Exception e) {
            log.error("Error creating faulty sensor alert: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Generate warning alert for degraded sensor
     */
    private void generateSensorWarningAlert(String deviceId, int consecutiveCount, SensorReading reading) {
        try {
            Alert alert = new Alert();
            alert.setAlertType("SENSOR_WARNING");
            alert.setSeverity("MEDIUM");
            alert.setTitle("Sensor Performance Degraded - " + deviceId);
            alert.setDescription(String.format(
                "Sensor %s has sent insufficient data %d times consecutively. " +
                "Check sensor connections and calibration.",
                deviceId, consecutiveCount
            ));
            alert.setSensorId(deviceId);
            alert.setLocation(reading.getLocation());
            alert.setTriggeredAt(Timestamp.now());
            alert.setStatus("ACTIVE");
            alert.setNotificationMethod("EMAIL");
            
            alertService.createAlert(alert);
            log.info("Created DEGRADED sensor alert for: {}", deviceId);
            
        } catch (Exception e) {
            log.error("Error creating degraded sensor alert: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Generate alert for sensor recovery
     */
    private void generateSensorRecoveryAlert(String deviceId, SensorReading reading) {
        try {
            Alert alert = new Alert();
            alert.setAlertType("SENSOR_RECOVERY");
            alert.setSeverity("LOW");
            alert.setTitle("Sensor Recovered - " + deviceId);
            alert.setDescription(String.format(
                "Sensor %s has recovered and is now sending complete data.",
                deviceId
            ));
            alert.setSensorId(deviceId);
            alert.setLocation(reading.getLocation());
            alert.setTriggeredAt(Timestamp.now());
            alert.setStatus("RESOLVED");
            alert.setNotificationMethod("EMAIL");
            
            alertService.createAlert(alert);
            log.info("Created RECOVERY alert for: {}", deviceId);
            
        } catch (Exception e) {
            log.error("Error creating recovery alert: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Reset sensor health history (for testing or maintenance)
     */
    public void resetSensorHealth(String deviceId) {
        sensorHealthHistory.remove(deviceId);
        sensorStatus.remove(deviceId);
        log.info("Reset health history for sensor: {}", deviceId);
    }
}
