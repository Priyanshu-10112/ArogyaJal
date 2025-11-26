package com.arogyajal.dto;

/**
 * Device Health Information
 * Separate from water quality assessment
 */
public class DeviceHealth {
    
    private Double batteryVoltage;   // Battery voltage in volts
    private String batteryStatus;    // NORMAL, LOW, CRITICAL, NOT_REPORTING
    
    public DeviceHealth() {
    }
    
    public DeviceHealth(Double batteryVoltage, String batteryStatus) {
        this.batteryVoltage = batteryVoltage;
        this.batteryStatus = batteryStatus;
    }
    
    // Getters and Setters
    
    public Double getBatteryVoltage() {
        return batteryVoltage;
    }
    
    public void setBatteryVoltage(Double batteryVoltage) {
        this.batteryVoltage = batteryVoltage;
    }
    
    public String getBatteryStatus() {
        return batteryStatus;
    }
    
    public void setBatteryStatus(String batteryStatus) {
        this.batteryStatus = batteryStatus;
    }
    
    @Override
    public String toString() {
        return "DeviceHealth{" +
               "batteryVoltage=" + batteryVoltage +
               ", batteryStatus='" + batteryStatus + '\'' +
               '}';
    }
}
