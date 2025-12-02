package com.arogyajal.service;

import com.arogyajal.dto.ReportData;
import com.arogyajal.model.Alert;
import com.arogyajal.model.SensorReading;
import com.arogyajal.repository.SensorRepository;
import com.google.cloud.Timestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    
    private final SensorRepository sensorRepository;
    private final AlertService alertService;
    private final OutbreakPredictionService predictionService;
    private final LocationService locationService;
    
    public ReportService(SensorRepository sensorRepository,
                        AlertService alertService,
                        OutbreakPredictionService predictionService,
                        LocationService locationService) {
        this.sensorRepository = sensorRepository;
        this.alertService = alertService;
        this.predictionService = predictionService;
        this.locationService = locationService;
    }
    
    public ReportData generateReport(String state, String district, String city, String village, int hours) {
        log.info("Generating report for region: state={}, district={}, city={}, village={}, hours={}",
                state, district, city, village, hours);
        
        ReportData report = new ReportData();
        
        // 1. Set metadata
        report.setMetadata(buildMetadata(state, district, city, village, hours));
        
        // 2. Get sensor readings for time range
        Timestamp startTime = Timestamp.ofTimeSecondsAndNanos(
            Instant.now().minusSeconds(hours * 3600L).getEpochSecond(), 0);
        Timestamp endTime = Timestamp.now();
        
        List<SensorReading> readings = getFilteredReadings(state, district, city, village, startTime, endTime);
        
        // Update metadata with reporting devices count
        Set<String> reportingDevices = readings.stream()
            .map(SensorReading::getSensorId)
            .collect(Collectors.toSet());
        report.getMetadata().setReportingDevices24h(reportingDevices.size());
        
        // 3. Build water quality summary
        report.setWaterQualitySummary(buildWaterQualitySummary(readings));
        
        // 4. Build sensor history
        report.setSensorHistory(buildSensorHistory(readings));
        
        // 5. Get alerts
        List<ReportData.AlertSummary> alerts = buildAlertsSummary(state, district, city, village, startTime, endTime);
        report.setAlerts(alerts);
        
        // 6. Get ML prediction with real factors
        report.setMlPrediction(buildMLPredictionSummary(readings, alerts));
        
        // 7. Add clarification message if no data available
        if (readings.isEmpty() && alerts.isEmpty()) {
            report.setClarificationMessage(
                "No recent activity detected for this region.\n\n" +
                "Possible reasons:\n" +
                "• Sensor offline or in low-connectivity zone\n" +
                "• No water quality issues detected\n" +
                "• Maintenance or network downtime\n" +
                "• Device battery drain\n\n" +
                "Recommendation:\n" +
                "Please verify device health on dashboard or re-run report after data update."
            );
        }
        
        log.info("Report generated successfully with {} sensors, {} alerts",
                reportingDevices.size(), alerts.size());
        
        return report;
    }
    
    private ReportData.ReportMetadata buildMetadata(String state, String district, String city, String village, int hours) {
        ReportData.ReportMetadata metadata = new ReportData.ReportMetadata();
        
        // Build region name
        StringBuilder regionName = new StringBuilder();
        if (village != null && !village.isEmpty()) {
            regionName.append(village).append(", ");
        }
        if (city != null && !city.isEmpty()) {
            regionName.append(city).append(", ");
        }
        if (district != null && !district.isEmpty()) {
            regionName.append(district).append(", ");
        }
        if (state != null && !state.isEmpty()) {
            regionName.append(state);
        }
        
        if (regionName.length() == 0) {
            regionName.append("All Regions (North East India)");
        }
        
        metadata.setRegionName(regionName.toString());
        metadata.setTimeRange("Last " + hours + " hours");
        metadata.setGeneratedAt(DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
        metadata.setReportType("Water Quality & Outbreak Risk Report");
        
        // Build scope description
        StringBuilder scope = new StringBuilder();
        if (state != null && !state.isEmpty()) scope.append(state);
        if (district != null && !district.isEmpty()) scope.append(" / ").append(district);
        if (city != null && !city.isEmpty()) scope.append(" / ").append(city);
        if (village != null && !village.isEmpty()) scope.append(" / ").append(village);
        if (scope.length() == 0) scope.append("All Regions");
        metadata.setScope(scope.toString());
        
        // Get total configured devices (from device registry)
        try {
            List<String> allDeviceIds = locationService.getAllDeviceIds();
            metadata.setConfiguredDevices(allDeviceIds.size());
        } catch (Exception e) {
            metadata.setConfiguredDevices(0);
        }
        
        return metadata;
    }
    
    private List<SensorReading> getFilteredReadings(String state, String district, String city, String village,
                                                     Timestamp startTime, Timestamp endTime) {
        try {
            List<SensorReading> allReadings = sensorRepository.findByTimestampBetween(startTime, endTime);
            
            // Filter by location if specified
            if (state == null && district == null && city == null && village == null) {
                return allReadings;
            }
            
            return allReadings.stream()
                .filter(reading -> matchesLocation(reading, state, district, city, village))
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error fetching filtered readings", e);
            return new ArrayList<>();
        }
    }
    
    private boolean matchesLocation(SensorReading reading, String state, String district, String city, String village) {
        // Simple location matching based on sensor location string
        String location = reading.getLocation();
        if (location == null) return false;
        
        location = location.toLowerCase();
        
        if (village != null && !village.isEmpty() && !location.contains(village.toLowerCase())) {
            return false;
        }
        if (city != null && !city.isEmpty() && !location.contains(city.toLowerCase())) {
            return false;
        }
        if (district != null && !district.isEmpty() && !location.contains(district.toLowerCase())) {
            return false;
        }
        if (state != null && !state.isEmpty() && !location.contains(state.toLowerCase())) {
            return false;
        }
        
        return true;
    }
    
    private ReportData.WaterQualitySummary buildWaterQualitySummary(List<SensorReading> readings) {
        ReportData.WaterQualitySummary summary = new ReportData.WaterQualitySummary();
        
        if (readings.isEmpty()) {
            summary.setTotalSensors(0);
            summary.setActiveSensors(0);
            return summary;
        }
        
        // Get unique sensors
        Set<String> uniqueSensors = readings.stream()
            .map(SensorReading::getSensorId)
            .collect(Collectors.toSet());
        
        summary.setTotalSensors(uniqueSensors.size());
        summary.setActiveSensors(uniqueSensors.size());
        
        // Calculate stats for each parameter
        List<Double> phValues = readings.stream()
            .map(SensorReading::getPh)
            .filter(Objects::nonNull)
            .filter(v -> v > 0)
            .collect(Collectors.toList());
        
        List<Double> tdsValues = readings.stream()
            .map(SensorReading::getTotalDissolvedSolids)
            .filter(Objects::nonNull)
            .filter(v -> v > 0)
            .collect(Collectors.toList());
        
        List<Double> turbidityValues = readings.stream()
            .map(SensorReading::getTurbidity)
            .filter(Objects::nonNull)
            .filter(v -> v > 0)
            .collect(Collectors.toList());
        
        List<Double> tempValues = readings.stream()
            .map(SensorReading::getTemperature)
            .filter(Objects::nonNull)
            .filter(v -> v > 0)
            .collect(Collectors.toList());
        
        summary.setPh(calculateStats(phValues));
        summary.setTds(calculateStats(tdsValues));
        summary.setTurbidity(calculateStats(turbidityValues));
        summary.setTemperature(calculateStats(tempValues));
        
        return summary;
    }
    
    private ReportData.ParameterStats calculateStats(List<Double> values) {
        if (values.isEmpty()) {
            return new ReportData.ParameterStats(0, 0, 0);
        }
        
        double min = values.stream().min(Double::compare).orElse(0.0);
        double max = values.stream().max(Double::compare).orElse(0.0);
        double avg = values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        
        return new ReportData.ParameterStats(min, max, avg);
    }
    
    private List<ReportData.SensorHistory> buildSensorHistory(List<SensorReading> readings) {
        Map<String, List<SensorReading>> groupedBySensor = readings.stream()
            .collect(Collectors.groupingBy(SensorReading::getSensorId));
        
        List<ReportData.SensorHistory> history = new ArrayList<>();
        
        for (Map.Entry<String, List<SensorReading>> entry : groupedBySensor.entrySet()) {
            ReportData.SensorHistory sensorHistory = new ReportData.SensorHistory();
            sensorHistory.setDeviceId(entry.getKey());
            
            List<SensorReading> sensorReadings = entry.getValue();
            if (!sensorReadings.isEmpty()) {
                sensorHistory.setLocation(sensorReadings.get(0).getLocation());
            }
            
            List<ReportData.TimeSeriesData> timeSeriesData = sensorReadings.stream()
                .sorted(Comparator.comparing(SensorReading::getTimestamp))
                .map(this::convertToTimeSeriesData)
                .collect(Collectors.toList());
            
            sensorHistory.setReadings(timeSeriesData);
            history.add(sensorHistory);
        }
        
        return history;
    }
    
    private ReportData.TimeSeriesData convertToTimeSeriesData(SensorReading reading) {
        ReportData.TimeSeriesData data = new ReportData.TimeSeriesData();
        
        if (reading.getTimestamp() != null) {
            data.setTimestamp(DateTimeFormatter.ISO_INSTANT.format(
                Instant.ofEpochSecond(reading.getTimestamp().getSeconds())));
        }
        
        data.setPh(reading.getPh() != null ? reading.getPh() : 0);
        data.setTds(reading.getTotalDissolvedSolids() != null ? reading.getTotalDissolvedSolids() : 0);
        data.setTurbidity(reading.getTurbidity() != null ? reading.getTurbidity() : 0);
        data.setTemperature(reading.getTemperature() != null ? reading.getTemperature() : 0);
        data.setWqi(reading.getWqi() != null ? reading.getWqi() : 0);
        
        return data;
    }
    
    private List<ReportData.AlertSummary> buildAlertsSummary(String state, String district, String city, String village,
                                                              Timestamp startTime, Timestamp endTime) {
        try {
            List<Alert> alerts = alertService.getAlertsByTimeRange(startTime, endTime);
            
            return alerts.stream()
                .filter(alert -> matchesAlertLocation(alert, state, district, city, village))
                .map(this::convertToAlertSummary)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error fetching alerts", e);
            return new ArrayList<>();
        }
    }
    
    private boolean matchesAlertLocation(Alert alert, String state, String district, String city, String village) {
        String location = alert.getLocation();
        if (location == null) return false;
        
        location = location.toLowerCase();
        
        if (village != null && !village.isEmpty() && !location.contains(village.toLowerCase())) {
            return false;
        }
        if (city != null && !city.isEmpty() && !location.contains(city.toLowerCase())) {
            return false;
        }
        if (district != null && !district.isEmpty() && !location.contains(district.toLowerCase())) {
            return false;
        }
        if (state != null && !state.isEmpty() && !location.contains(state.toLowerCase())) {
            return false;
        }
        
        return true;
    }
    
    private ReportData.AlertSummary convertToAlertSummary(Alert alert) {
        ReportData.AlertSummary summary = new ReportData.AlertSummary();
        
        summary.setAlertId(alert.getId());
        summary.setType(alert.getAlertType());
        summary.setSeverity(alert.getSeverity());
        summary.setStatus(alert.getStatus());
        summary.setDescription(alert.getDescription());
        summary.setDeviceId(alert.getSensorId());
        
        if (alert.getTriggeredAt() != null) {
            summary.setTimestamp(DateTimeFormatter.ISO_INSTANT.format(
                Instant.ofEpochSecond(alert.getTriggeredAt().getSeconds())));
        }
        
        return summary;
    }
    
    private ReportData.MLPredictionSummary buildMLPredictionSummary(List<SensorReading> readings, 
                                                                     List<ReportData.AlertSummary> alerts) {
        ReportData.MLPredictionSummary summary = new ReportData.MLPredictionSummary();
        
        try {
            // If no data available, return early with clear message
            if (readings.isEmpty() && alerts.isEmpty()) {
                summary.setRiskScore(0.0);
                summary.setRiskLevel("UNKNOWN");
                summary.setConfidence(0.0);
                summary.setContributingFactors(new HashMap<>());
                summary.setRecommendations(Arrays.asList(
                    "Please verify device health on dashboard or re-run report after data update"
                ));
                summary.setExplanation("No sensor data or alerts available for risk assessment.");
                return summary;
            }
            
            // Calculate real contributing factors based on actual data
            Map<String, Double> factors = new HashMap<>();
            
            // 1. Cluster Factor (0-50): Based on symptom cluster alerts
            long clusterAlerts = alerts.stream()
                .filter(a -> "SYMPTOM_CLUSTER".equals(a.getType()))
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .count();
            
            long highSeverityClusterAlerts = alerts.stream()
                .filter(a -> "SYMPTOM_CLUSTER".equals(a.getType()))
                .filter(a -> "HIGH".equals(a.getSeverity()) || "CRITICAL".equals(a.getSeverity()))
                .count();
            
            double clusterFactor = Math.min(clusterAlerts * 12.0 + highSeverityClusterAlerts * 8.0, 50.0);
            factors.put("cluster_factor", clusterFactor);
            
            // 2. Report Factor (0-20): Based on symptom reports (via alerts)
            long symptomReportAlerts = alerts.stream()
                .filter(a -> a.getType() != null && 
                           (a.getType().contains("SYMPTOM") || a.getType().contains("HEALTH")))
                .count();
            double reportFactor = Math.min(symptomReportAlerts * 3.0, 20.0);
            factors.put("report_factor", reportFactor);
            
            // 3. Quality Factor (0-20): Based on poor WQI sensors
            long poorSensors = readings.stream()
                .filter(r -> r.getWqi() != null && r.getWqi() > 75)
                .map(SensorReading::getSensorId)
                .distinct()
                .count();
            
            long veryPoorSensors = readings.stream()
                .filter(r -> r.getWqi() != null && r.getWqi() > 100)
                .map(SensorReading::getSensorId)
                .distinct()
                .count();
            
            long totalSensors = readings.stream()
                .map(SensorReading::getSensorId)
                .distinct()
                .count();
            
            double qualityFactor = 0.0;
            if (totalSensors > 0) {
                qualityFactor = (poorSensors * 15.0 / totalSensors) + (veryPoorSensors * 5.0 / totalSensors);
                qualityFactor = Math.min(qualityFactor, 20.0);
            }
            factors.put("quality_factor", qualityFactor);
            
            // 4. Source Factor (0-10): Based on water quality alerts
            long waterQualityAlerts = alerts.stream()
                .filter(a -> "WATER_QUALITY".equals(a.getType()))
                .count();
            double sourceFactor = Math.min(waterQualityAlerts * 2.5, 10.0);
            factors.put("source_factor", sourceFactor);
            
            // Calculate total risk score
            double riskScore = clusterFactor + reportFactor + qualityFactor + sourceFactor;
            
            // Determine risk level
            String riskLevel;
            if (riskScore >= 75) {
                riskLevel = "CRITICAL";
            } else if (riskScore >= 50) {
                riskLevel = "HIGH";
            } else if (riskScore >= 25) {
                riskLevel = "MEDIUM";
            } else {
                riskLevel = "LOW";
            }
            
            // Calculate confidence based on data availability
            double confidence = calculateConfidence(readings, alerts);
            
            // Generate human-readable explanation
            String explanation = generateExplanation(riskLevel, riskScore, confidence, 
                                                    clusterAlerts, highSeverityClusterAlerts, 
                                                    poorSensors, totalSensors, waterQualityAlerts);
            
            // Generate recommendations
            List<String> recommendations = generateRecommendations(riskLevel, clusterAlerts, poorSensors, waterQualityAlerts);
            
            summary.setRiskScore(riskScore);
            summary.setRiskLevel(riskLevel);
            summary.setConfidence(confidence);
            summary.setContributingFactors(factors);
            summary.setRecommendations(recommendations);
            summary.setExplanation(explanation);
            
            log.info("ML prediction calculated - Risk: {} ({}), Confidence: {}%, Factors: cluster={}, report={}, quality={}, source={}",
                    riskScore, riskLevel, confidence, clusterFactor, reportFactor, qualityFactor, sourceFactor);
            
            return summary;
            
        } catch (Exception e) {
            log.error("Error building ML prediction summary", e);
            
            // Return safe defaults
            summary.setRiskScore(0.0);
            summary.setRiskLevel("UNKNOWN");
            summary.setConfidence(0.0);
            summary.setContributingFactors(new HashMap<>());
            summary.setRecommendations(Arrays.asList("Prediction not available for this region in the last 24 hours"));
            summary.setExplanation("Error calculating risk assessment. Please try again.");
            
            return summary;
        }
    }
    
    private String generateExplanation(String riskLevel, double riskScore, double confidence,
                                       long clusterAlerts, long highSeverityClusterAlerts,
                                       long poorSensors, long totalSensors, long waterQualityAlerts) {
        StringBuilder explanation = new StringBuilder();
        
        explanation.append(String.format("Current risk is %s with a score of %.1f and confidence %.1f%%. ", 
                                        riskLevel, riskScore, confidence));
        
        // Build explanation based on contributing factors
        List<String> factors = new ArrayList<>();
        
        if (clusterAlerts > 0) {
            if (highSeverityClusterAlerts > 0) {
                factors.add(String.format("%d active symptom cluster(s) including %d high-severity case(s)", 
                                        clusterAlerts, highSeverityClusterAlerts));
            } else {
                factors.add(String.format("%d active symptom cluster(s)", clusterAlerts));
            }
        }
        
        if (poorSensors > 0 && totalSensors > 0) {
            double percentage = (poorSensors * 100.0 / totalSensors);
            factors.add(String.format("%.0f%% of sensors (%d/%d) showing poor water quality", 
                                    percentage, poorSensors, totalSensors));
        }
        
        if (waterQualityAlerts > 0) {
            factors.add(String.format("%d water quality alert(s)", waterQualityAlerts));
        }
        
        if (factors.isEmpty()) {
            explanation.append("No significant risk factors detected. ");
            explanation.append("Continue routine monitoring and maintain preventive measures.");
        } else {
            explanation.append("This is primarily driven by: ");
            for (int i = 0; i < factors.size(); i++) {
                explanation.append(factors.get(i));
                if (i < factors.size() - 2) {
                    explanation.append(", ");
                } else if (i == factors.size() - 2) {
                    explanation.append(" and ");
                } else {
                    explanation.append(".");
                }
            }
        }
        
        return explanation.toString();
    }
    
    private double calculateConfidence(List<SensorReading> readings, List<ReportData.AlertSummary> alerts) {
        double confidence = 0.0;
        
        // Sensor data availability (0-40 points)
        long uniqueSensors = readings.stream()
            .map(SensorReading::getSensorId)
            .distinct()
            .count();
        
        if (uniqueSensors >= 5) {
            confidence += 40;
        } else {
            confidence += (uniqueSensors / 5.0) * 40;
        }
        
        // Data recency (0-30 points) - if we have readings in last 24h
        if (!readings.isEmpty()) {
            confidence += 30;
        }
        
        // Alert data (0-30 points)
        if (alerts.size() >= 3) {
            confidence += 30;
        } else {
            confidence += (alerts.size() / 3.0) * 30;
        }
        
        return Math.min(confidence, 100.0);
    }
    
    private List<String> generateRecommendations(String riskLevel, long clusterAlerts, long poorSensors, long waterAlerts) {
        List<String> recommendations = new ArrayList<>();
        
        if ("CRITICAL".equals(riskLevel)) {
            recommendations.add("PRIORITY: Immediate intervention required");
            recommendations.add("PRIORITY: Deploy emergency medical teams");
            recommendations.add("Activate outbreak response protocol");
            recommendations.add("Issue public health advisory");
        } else if ("HIGH".equals(riskLevel)) {
            recommendations.add("PRIORITY: Increase surveillance and monitoring");
            recommendations.add("Prepare emergency response resources");
            recommendations.add("Issue health advisory to community");
            recommendations.add("Conduct water quality testing");
        } else if ("MEDIUM".equals(riskLevel)) {
            recommendations.add("Continue monitoring situation closely");
            recommendations.add("Increase testing frequency");
            recommendations.add("Conduct preventive health education");
            recommendations.add("Monitor water sources");
        } else {
            recommendations.add("Continue routine surveillance");
            recommendations.add("Maintain regular monitoring schedule");
        }
        
        // Add specific recommendations based on factors
        if (clusterAlerts > 0) {
            recommendations.add("PRIORITY: Investigate active symptom clusters");
        }
        if (poorSensors > 0) {
            recommendations.add("Address water quality issues at " + poorSensors + " sensor location(s)");
        }
        if (waterAlerts > 0) {
            recommendations.add("Respond to " + waterAlerts + " water quality alert(s)");
        }
        
        return recommendations;
    }
    
    private double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }
    
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }
    
    public ReportData generateEmptyReport(String state, String district, String city, String village) {
        ReportData report = new ReportData();
        
        // Set metadata
        report.setMetadata(buildMetadata(state, district, city, village, 24));
        
        // Empty summary
        ReportData.WaterQualitySummary summary = new ReportData.WaterQualitySummary();
        summary.setTotalSensors(0);
        summary.setActiveSensors(0);
        summary.setPh(new ReportData.ParameterStats(0, 0, 0));
        summary.setTds(new ReportData.ParameterStats(0, 0, 0));
        summary.setTurbidity(new ReportData.ParameterStats(0, 0, 0));
        summary.setTemperature(new ReportData.ParameterStats(0, 0, 0));
        report.setWaterQualitySummary(summary);
        
        // Empty lists
        report.setSensorHistory(new ArrayList<>());
        report.setAlerts(new ArrayList<>());
        
        // Default ML prediction
        ReportData.MLPredictionSummary mlSummary = new ReportData.MLPredictionSummary();
        mlSummary.setRiskScore(0.0);
        mlSummary.setRiskLevel("UNKNOWN");
        mlSummary.setConfidence(0.0);
        mlSummary.setContributingFactors(new HashMap<>());
        mlSummary.setRecommendations(Arrays.asList(
            "Please verify device health on dashboard or re-run report after data update"
        ));
        report.setMlPrediction(mlSummary);
        
        // Add clarification message
        report.setClarificationMessage(
            "No recent activity detected for this region.\n\n" +
            "Possible reasons:\n" +
            "• Sensor offline or in low-connectivity zone\n" +
            "• No water quality issues detected\n" +
            "• Maintenance or network downtime\n" +
            "• Device battery drain\n\n" +
            "Recommendation:\n" +
            "Please verify device health on dashboard or re-run report after data update."
        );
        
        return report;
    }
}
