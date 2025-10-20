package com.arogyajal.controller;

import com.arogyajal.dto.SensorData;
import com.arogyajal.model.SensorReading;
import com.arogyajal.service.SensorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.cloud.Timestamp;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Response class for sensor statistics
 */
@lombok.Data
class SensorStatisticsResponse {
    private long totalReadings;
    private List<String> deviceIds = new ArrayList<>();
    private List<String> locations = new ArrayList<>();
	public long getTotalReadings() {
		return totalReadings;
	}
	public void setTotalReadings(long totalReadings) {
		this.totalReadings = totalReadings;
	}
	public List<String> getDeviceIds() {
		return deviceIds;
	}
	public void setDeviceIds(List<String> deviceIds) {
		this.deviceIds = deviceIds;
	}
	public List<String> getLocations() {
		return locations;
	}
	public void setLocations(List<String> locations) {
		this.locations = locations;
	}
}

@RestController
@RequestMapping("/api")
@Tag(name = "Sensor Data API", description = "APIs for handling sensor data")
public class SensorController {

    private static final Logger log = LoggerFactory.getLogger(SensorController.class);
    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @PostMapping("/sensor-data")
    @Operation(summary = "Submit sensor data", 
              description = "Receive sensor data from IoT devices in JSON format")
    public ResponseEntity<Map<String, Object>> receiveSensorData(
            @Valid @RequestBody SensorData sensorData) {
        
        log.info("Received sensor data from device: {}", sensorData.getDeviceId());
        
        try {
            // Process and save the sensor data
            SensorData savedData = sensorService.processAndSaveSensorData(sensorData);
            
            // Log the received data
            if (sensorData.getLocation() != null) {
                log.info("Location: {}°N, {}°E", 
                        sensorData.getLocation().getLat(), 
                        sensorData.getLocation().getLon());
            }
            
            if (sensorData.getSensors() != null) {
                log.info("Sensors - pH: {}, Temp: {}°C, TDS: {}ppm, DO: {}mg/L, Turbidity: {}NTU",
                        sensorData.getSensors().getPH() != null ? sensorData.getSensors().getPH() : "N/A",
                        sensorData.getSensors().getTemperature_C() != null ? sensorData.getSensors().getTemperature_C() : "N/A",
                        sensorData.getSensors().getTDS_ppm() != null ? sensorData.getSensors().getTDS_ppm() : "N/A",
                        sensorData.getSensors().getDO_mgL() != null ? sensorData.getSensors().getDO_mgL() : "N/A",
                        sensorData.getSensors().getTurbidity_NTU() != null ? sensorData.getSensors().getTurbidity_NTU() : "N/A");
            }
            
            // Create a success response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Data received and processed successfully");
            response.put("deviceId", savedData.getDeviceId());
            response.put("timestamp", savedData.getTimestamp().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing sensor data: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to process sensor data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/sensor-data/readings")
    @Operation(summary = "Get recent sensor readings",
              description = "Retrieve a list of recent sensor readings with pagination")
    public ResponseEntity<List<SensorData>> getRecentReadings(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<SensorData> readings = sensorService.getRecentReadings(limit);
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error fetching recent readings: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/sensor-data/latest")
    @Operation(summary = "Get latest sensor data", 
              description = "Retrieve the most recent sensor data")
    public ResponseEntity<?> getLatestSensorData() {
        try {
            SensorData latestData = sensorService.getLatestSensorData();
            if (latestData != null) {
                return ResponseEntity.ok(latestData);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "No sensor data available");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            log.error("Error retrieving latest sensor data: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to retrieve latest sensor data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/sensor-data/device/{deviceId}")
    @Operation(summary = "Get latest sensor data by device ID", 
              description = "Retrieve the most recent sensor data for a specific device")
    public ResponseEntity<?> getLatestSensorDataByDeviceId(
            @Parameter(description = "Device ID") @PathVariable String deviceId) {
        try {
            SensorData sensorData = sensorService.getSensorDataByDeviceId(deviceId);
            if (sensorData != null) {
                return ResponseEntity.ok(sensorData);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "No data available for device: " + deviceId);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            log.error("Error retrieving sensor data for device {}: {}", deviceId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to retrieve sensor data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/sensor-data/debug/{deviceId}")
    @Operation(summary = "Debug endpoint to log all data for a device",
              description = "Debug endpoint that logs all sensor data for a specific device")
    public ResponseEntity<?> debugDeviceData(@PathVariable String deviceId) {
        try {
            sensorService.debugDeviceData(deviceId);
            return ResponseEntity.ok().body("Debug information logged for device: " + deviceId);
        } catch (Exception e) {
            log.error("Error in debugDeviceData: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body("Error debugging device data: " + e.getMessage());
        }
    }
    
    @GetMapping("/sensor-data/device-ids")
    @Operation(summary = "List all device IDs",
              description = "Get a list of all available device IDs in the system")
    public ResponseEntity<Map<String, Object>> listDeviceIds() {
        log.info("Fetching all device IDs");
        try {
            List<String> deviceIds = sensorService.getDistinctDeviceIds();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("count", deviceIds.size());
            response.put("deviceIds", deviceIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching device IDs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to fetch device IDs: " + e.getMessage()));
        }
    }
    
    @GetMapping("/sensor-data/statistics")
    @Operation(summary = "Get sensor data statistics",
              description = "Get statistics about the sensor data")
    public ResponseEntity<SensorStatisticsResponse> getStatistics() {
        log.info("Fetching sensor data statistics");
        try {
            SensorStatisticsResponse response = new SensorStatisticsResponse();
            response.setTotalReadings(sensorService.getTotalReadings());
            response.setDeviceIds(sensorService.getDistinctDeviceIds());
            response.setLocations(sensorService.getDistinctLocations());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching sensor data statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/all-readings")
    @Operation(summary = "Get all sensor readings", description = "Retrieve all sensor readings")
    public ResponseEntity<List<SensorReading>> getAllSensorReadings() {
        log.info("Retrieving all sensor readings");
        try {
            List<SensorReading> readings = sensorService.getAllSensorReadings();
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error retrieving all sensor readings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/sensor-data/readings/time-range")
    @Operation(summary = "Get readings by time range", 
              description = "Retrieve sensor readings within a specific time range")
    public ResponseEntity<List<SensorReading>> getReadingsByTimeRange(
            @Parameter(description = "Start time in seconds since epoch") @RequestParam long startSeconds,
            @Parameter(description = "End time in seconds since epoch") @RequestParam long endSeconds) {
        Timestamp start = Timestamp.ofTimeSecondsAndNanos(startSeconds, 0);
        Timestamp end = Timestamp.ofTimeSecondsAndNanos(endSeconds, 0);
        log.info("Retrieving readings between {} and {}", start, end);
        try {
            List<SensorReading> readings = sensorService.getReadingsByTimeRange(start, end);
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error retrieving readings by time range: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/readings/{id}")
    @Operation(summary = "Get sensor reading by ID", description = "Retrieve a specific sensor reading by its ID")
    public ResponseEntity<SensorReading> getSensorReadingById(
            @Parameter(description = "Sensor reading ID") @PathVariable String id) {
        log.info("Retrieving sensor reading by ID: {}", id);
        try {
            return sensorService.getSensorReadingById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving sensor reading with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/readings/sensor/{sensorId}")
    @Operation(summary = "Get readings by sensor ID", description = "Retrieve all readings for a specific sensor")
    public ResponseEntity<List<SensorReading>> getReadingsBySensorId(
            @Parameter(description = "Sensor ID") @PathVariable String sensorId) {
        log.info("Retrieving readings for sensor: {}", sensorId);
        try {
            List<SensorReading> readings = sensorService.getReadingsBySensorId(sensorId);
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error retrieving readings for sensor {}: {}", sensorId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/readings/sensor/{sensorId}/latest")
    @Operation(summary = "Get latest reading by sensor ID", 
              description = "Retrieve the most recent reading for a specific sensor")
    public ResponseEntity<SensorReading> getLatestReadingBySensorId(
            @Parameter(description = "Sensor ID") @PathVariable String sensorId) {
        log.info("Retrieving latest reading for sensor: {}", sensorId);
        try {
            return sensorService.getLatestReadingBySensorId(sensorId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving latest reading for sensor {}: {}", sensorId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/readings/quality/{qualityStatus}")
    @Operation(summary = "Get readings by quality status", 
              description = "Retrieve readings filtered by quality status (GOOD, WARNING, CRITICAL)")
    public ResponseEntity<List<SensorReading>> getReadingsByQualityStatus(
            @Parameter(description = "Quality status (GOOD, WARNING, CRITICAL)") @PathVariable String qualityStatus) {
        log.info("Retrieving readings with quality status: {}", qualityStatus);
        try {
            List<SensorReading> readings = sensorService.getReadingsByQualityStatus(qualityStatus.toUpperCase());
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error retrieving readings with quality status {}: {}", qualityStatus, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sensor-data/readings/critical")
    @Operation(summary = "Get critical readings", 
              description = "Retrieve all readings with critical water quality parameters")
    public ResponseEntity<List<SensorReading>> getCriticalReadings() {
        log.info("Retrieving critical sensor readings");
        try {
            List<SensorReading> readings = sensorService.getCriticalReadings();
            return ResponseEntity.ok(readings);
        } catch (Exception e) {
            log.error("Error retrieving critical readings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    
    // Inner class for sensor statistics response
    public static class SensorStatisticsResponse {
        private long totalReadings;
        private List<String> deviceIds;
        private List<String> locations;
        
        public SensorStatisticsResponse() {
            this.deviceIds = new ArrayList<>();
            this.locations = new ArrayList<>();
        }
        
        public long getTotalReadings() {
            return totalReadings;
        }
        
        public void setTotalReadings(long totalReadings) {
            this.totalReadings = totalReadings;
        }
        
        public List<String> getDeviceIds() {
            return deviceIds;
        }
        
        public void setDeviceIds(List<String> deviceIds) {
            this.deviceIds = deviceIds;
        }
        
        public List<String> getLocations() {
            return locations;
        }
        
        public void setLocations(List<String> locations) {
            this.locations = locations;
        }
    }
}
