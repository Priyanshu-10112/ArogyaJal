package com.arogyajal.dto;

import java.util.List;
import java.util.Map;

public class ReportData {
    
    // Metadata
    private ReportMetadata metadata;
    
    // Water quality summary
    private WaterQualitySummary waterQualitySummary;
    
    // Sensor history
    private List<SensorHistory> sensorHistory;
    
    // Alerts
    private List<AlertSummary> alerts;
    
    // ML prediction
    private MLPredictionSummary mlPrediction;
    
    // Constructors
    public ReportData() {}
    
    // Getters and Setters
    public ReportMetadata getMetadata() { return metadata; }
    public void setMetadata(ReportMetadata metadata) { this.metadata = metadata; }
    
    public WaterQualitySummary getWaterQualitySummary() { return waterQualitySummary; }
    public void setWaterQualitySummary(WaterQualitySummary waterQualitySummary) { 
        this.waterQualitySummary = waterQualitySummary; 
    }
    
    public List<SensorHistory> getSensorHistory() { return sensorHistory; }
    public void setSensorHistory(List<SensorHistory> sensorHistory) { 
        this.sensorHistory = sensorHistory; 
    }
    
    public List<AlertSummary> getAlerts() { return alerts; }
    public void setAlerts(List<AlertSummary> alerts) { this.alerts = alerts; }
    
    public MLPredictionSummary getMlPrediction() { return mlPrediction; }
    public void setMlPrediction(MLPredictionSummary mlPrediction) { 
        this.mlPrediction = mlPrediction; 
    }
    
    // Inner classes
    public static class ReportMetadata {
        private String regionName;
        private String timeRange;
        private String generatedAt;
        private String reportType;
        private String scope;
        private int configuredDevices;
        private int reportingDevices24h;
        
        public ReportMetadata() {}
        
        public String getRegionName() { return regionName; }
        public void setRegionName(String regionName) { this.regionName = regionName; }
        
        public String getTimeRange() { return timeRange; }
        public void setTimeRange(String timeRange) { this.timeRange = timeRange; }
        
        public String getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
        
        public String getReportType() { return reportType; }
        public void setReportType(String reportType) { this.reportType = reportType; }
        
        public String getScope() { return scope; }
        public void setScope(String scope) { this.scope = scope; }
        
        public int getConfiguredDevices() { return configuredDevices; }
        public void setConfiguredDevices(int configuredDevices) { this.configuredDevices = configuredDevices; }
        
        public int getReportingDevices24h() { return reportingDevices24h; }
        public void setReportingDevices24h(int reportingDevices24h) { this.reportingDevices24h = reportingDevices24h; }
    }
    
    public static class WaterQualitySummary {
        private ParameterStats ph;
        private ParameterStats tds;
        private ParameterStats turbidity;
        private ParameterStats temperature;
        private int totalSensors;
        private int activeSensors;
        
        public WaterQualitySummary() {}
        
        public ParameterStats getPh() { return ph; }
        public void setPh(ParameterStats ph) { this.ph = ph; }
        
        public ParameterStats getTds() { return tds; }
        public void setTds(ParameterStats tds) { this.tds = tds; }
        
        public ParameterStats getTurbidity() { return turbidity; }
        public void setTurbidity(ParameterStats turbidity) { this.turbidity = turbidity; }
        
        public ParameterStats getTemperature() { return temperature; }
        public void setTemperature(ParameterStats temperature) { this.temperature = temperature; }
        
        public int getTotalSensors() { return totalSensors; }
        public void setTotalSensors(int totalSensors) { this.totalSensors = totalSensors; }
        
        public int getActiveSensors() { return activeSensors; }
        public void setActiveSensors(int activeSensors) { this.activeSensors = activeSensors; }
    }
    
    public static class ParameterStats {
        private double min;
        private double max;
        private double avg;
        
        public ParameterStats() {}
        
        public ParameterStats(double min, double max, double avg) {
            this.min = min;
            this.max = max;
            this.avg = avg;
        }
        
        public double getMin() { return min; }
        public void setMin(double min) { this.min = min; }
        
        public double getMax() { return max; }
        public void setMax(double max) { this.max = max; }
        
        public double getAvg() { return avg; }
        public void setAvg(double avg) { this.avg = avg; }
    }
    
    public static class SensorHistory {
        private String deviceId;
        private String location;
        private List<TimeSeriesData> readings;
        
        public SensorHistory() {}
        
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public List<TimeSeriesData> getReadings() { return readings; }
        public void setReadings(List<TimeSeriesData> readings) { this.readings = readings; }
    }
    
    public static class TimeSeriesData {
        private String timestamp;
        private double ph;
        private double tds;
        private double turbidity;
        private double temperature;
        private double wqi;
        
        public TimeSeriesData() {}
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        
        public double getPh() { return ph; }
        public void setPh(double ph) { this.ph = ph; }
        
        public double getTds() { return tds; }
        public void setTds(double tds) { this.tds = tds; }
        
        public double getTurbidity() { return turbidity; }
        public void setTurbidity(double turbidity) { this.turbidity = turbidity; }
        
        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }
        
        public double getWqi() { return wqi; }
        public void setWqi(double wqi) { this.wqi = wqi; }
    }
    
    public static class AlertSummary {
        private String alertId;
        private String type;
        private String severity;
        private String timestamp;
        private String status;
        private String description;
        private String deviceId;
        
        public AlertSummary() {}
        
        public String getAlertId() { return alertId; }
        public void setAlertId(String alertId) { this.alertId = alertId; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    }
    
    public static class MLPredictionSummary {
        private double riskScore;
        private String riskLevel;
        private double confidence;
        private Map<String, Double> contributingFactors;
        private List<String> recommendations;
        private String explanation;
        
        public MLPredictionSummary() {}
        
        public double getRiskScore() { return riskScore; }
        public void setRiskScore(double riskScore) { this.riskScore = riskScore; }
        
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        
        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
        
        public Map<String, Double> getContributingFactors() { return contributingFactors; }
        public void setContributingFactors(Map<String, Double> contributingFactors) { 
            this.contributingFactors = contributingFactors; 
        }
        
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { 
            this.recommendations = recommendations; 
        }
        
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
