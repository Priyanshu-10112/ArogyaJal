package com.arogyajal.model;

import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.ServerTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
//import java.util.Objects;

/**
 * Represents an alert in the system for various types of notifications
 * including water quality issues, sensor status, and symptom clusters.
 */
public class Alert {
    
    @DocumentId
    private String id;
    private String alertType; // WATER_QUALITY, SENSOR_OFFLINE, SYMPTOM_CLUSTER, etc.
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String title;
    private String description;
    private String location;
    private String sensorId;
    private String parameter; // pH, TEMPERATURE, TURBIDITY, etc.
    private Double thresholdValue;
    private Double actualValue;
    private String sensorReadingId;
    @ServerTimestamp
    private LocalDateTime triggeredAt;
    
    @ServerTimestamp
    private LocalDateTime acknowledgedAt;
    
    @ServerTimestamp
    private LocalDateTime resolvedAt;
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
    private String notificationMethod; // EMAIL, SMS, PUSH, etc.
    private List<String> relatedSymptomReportIds = new ArrayList<>();
    private List<String> notifiedUsers = new ArrayList<>();
    private List<String> affectedUsers = new ArrayList<>();
    private String resolutionNotes;
    private String resolvedBy;
    private String actionTaken;
    private String notes;
    
    // Constructors
    public Alert() {
    }

    public Alert(String id, String alertType, String severity, String title, String description, String location,
                String sensorId, String parameter, Double thresholdValue, Double actualValue, String sensorReadingId,
                List<String> relatedSymptomReportIds, LocalDateTime triggeredAt, LocalDateTime acknowledgedAt,
                LocalDateTime resolvedAt, String status, List<String> notifiedUsers, String notificationMethod,
                String resolutionNotes, String resolvedBy, List<String> affectedUsers, String actionTaken, String notes) {
        this.id = id;
        this.alertType = alertType;
        this.severity = severity;
        this.title = title;
        this.description = description;
        this.location = location;
        this.sensorId = sensorId;
        this.parameter = parameter;
        this.thresholdValue = thresholdValue;
        this.actualValue = actualValue;
        this.sensorReadingId = sensorReadingId;
        this.relatedSymptomReportIds = relatedSymptomReportIds;
        this.triggeredAt = triggeredAt;
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedAt = resolvedAt;
        this.status = status;
        this.notifiedUsers = notifiedUsers;
        this.notificationMethod = notificationMethod;
        this.resolutionNotes = resolutionNotes;
        this.resolvedBy = resolvedBy;
        this.affectedUsers = affectedUsers;
        this.actionTaken = actionTaken;
        this.notes = notes;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getParameter() {
        return parameter;
    }

    public void setParameter(String parameter) {
        this.parameter = parameter;
    }

    public Double getThresholdValue() {
        return thresholdValue;
    }

    public void setThresholdValue(Double thresholdValue) {
        this.thresholdValue = thresholdValue;
    }

    public Double getActualValue() {
        return actualValue;
    }

    public void setActualValue(Double actualValue) {
        this.actualValue = actualValue;
    }

    public String getSensorReadingId() {
        return sensorReadingId;
    }

    public void setSensorReadingId(String sensorReadingId) {
        this.sensorReadingId = sensorReadingId;
    }

    public List<String> getRelatedSymptomReportIds() {
        return relatedSymptomReportIds;
    }

    public void setRelatedSymptomReportIds(List<String> relatedSymptomReportIds) {
        this.relatedSymptomReportIds = relatedSymptomReportIds;
    }

    public LocalDateTime getTriggeredAt() {
        return triggeredAt;
    }

    public void setTriggeredAt(LocalDateTime triggeredAt) {
        this.triggeredAt = triggeredAt;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getNotifiedUsers() {
        return notifiedUsers;
    }

    public void setNotifiedUsers(List<String> notifiedUsers) {
        this.notifiedUsers = notifiedUsers;
    }

    public String getNotificationMethod() {
        return notificationMethod;
    }

    public void setNotificationMethod(String notificationMethod) {
        this.notificationMethod = notificationMethod;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public List<String> getAffectedUsers() {
        return affectedUsers;
    }

    public void setAffectedUsers(List<String> affectedUsers) {
        this.affectedUsers = affectedUsers;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Builder pattern implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String alertType;
        private String severity;
        private String title;
        private String description;
        private String location;
        private String sensorId;
        private String parameter;
        private Double thresholdValue;
        private Double actualValue;
        private String sensorReadingId;
        private List<String> relatedSymptomReportIds;
        private LocalDateTime triggeredAt = LocalDateTime.now();
        private LocalDateTime acknowledgedAt;
        private LocalDateTime resolvedAt;
        private String status = "ACTIVE";
        private List<String> notifiedUsers = new ArrayList<>();
        private String notificationMethod;
        private String resolutionNotes;
        private String resolvedBy;
        private List<String> affectedUsers = new ArrayList<>();
        private String actionTaken;
        private String notes;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder alertType(String alertType) {
            this.alertType = alertType;
            return this;
        }

        public Builder severity(String severity) {
            this.severity = severity;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder sensorId(String sensorId) {
            this.sensorId = sensorId;
            return this;
        }

        public Builder parameter(String parameter) {
            this.parameter = parameter;
            return this;
        }

        public Builder thresholdValue(Double thresholdValue) {
            this.thresholdValue = thresholdValue;
            return this;
        }

        public Builder actualValue(Double actualValue) {
            this.actualValue = actualValue;
            return this;
        }

        public Builder sensorReadingId(String sensorReadingId) {
            this.sensorReadingId = sensorReadingId;
            return this;
        }

        public Builder relatedSymptomReportIds(List<String> relatedSymptomReportIds) {
            this.relatedSymptomReportIds = relatedSymptomReportIds;
            return this;
        }

        public Builder triggeredAt(LocalDateTime triggeredAt) {
            this.triggeredAt = triggeredAt;
            return this;
        }

        public Builder acknowledgedAt(LocalDateTime acknowledgedAt) {
            this.acknowledgedAt = acknowledgedAt;
            return this;
        }

        public Builder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder notifiedUsers(List<String> notifiedUsers) {
            this.notifiedUsers = notifiedUsers;
            return this;
        }

        public Builder notificationMethod(String notificationMethod) {
            this.notificationMethod = notificationMethod;
            return this;
        }

        public Builder resolutionNotes(String resolutionNotes) {
            this.resolutionNotes = resolutionNotes;
            return this;
        }

        public Builder resolvedBy(String resolvedBy) {
            this.resolvedBy = resolvedBy;
            return this;
        }

        public Builder affectedUsers(List<String> affectedUsers) {
            this.affectedUsers = affectedUsers;
            return this;
        }

        public Builder actionTaken(String actionTaken) {
            this.actionTaken = actionTaken;
            return this;
        }

        public Builder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public Alert build() {
            Alert alert = new Alert();
            alert.setId(id);
            alert.setAlertType(alertType);
            alert.setSeverity(severity);
            alert.setTitle(title);
            alert.setDescription(description);
            alert.setLocation(location);
            alert.setSensorId(sensorId);
            alert.setParameter(parameter);
            alert.setThresholdValue(thresholdValue);
            alert.setActualValue(actualValue);
            alert.setSensorReadingId(sensorReadingId);
            alert.setRelatedSymptomReportIds(relatedSymptomReportIds);
            alert.setTriggeredAt(triggeredAt);
            alert.setAcknowledgedAt(acknowledgedAt);
            alert.setResolvedAt(resolvedAt);
            alert.setStatus(status);
            alert.setNotifiedUsers(notifiedUsers);
            alert.setNotificationMethod(notificationMethod);
            alert.setResolutionNotes(resolutionNotes);
            alert.setResolvedBy(resolvedBy);
            alert.setAffectedUsers(affectedUsers);
            alert.setActionTaken(actionTaken);
            alert.setNotes(notes);
            return alert;
        }
    }

    @Override
    public String toString() {
        return "Alert{" +
                "id='" + id + '\'' +
                ", alertType='" + alertType + '\'' +
                ", severity='" + severity + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", location='" + location + '\'' +
                ", sensorId='" + sensorId + '\'' +
                ", parameter='" + parameter + '\'' +
                ", thresholdValue=" + thresholdValue +
                ", actualValue=" + actualValue +
                ", sensorReadingId='" + sensorReadingId + '\'' +
                ", relatedSymptomReportIds=" + relatedSymptomReportIds +
                ", triggeredAt=" + triggeredAt +
                ", acknowledgedAt=" + acknowledgedAt +
                ", resolvedAt=" + resolvedAt +
                ", status='" + status + '\'' +
                ", notifiedUsers=" + notifiedUsers +
                ", notificationMethod='" + notificationMethod + '\'' +
                ", resolutionNotes='" + resolutionNotes + '\'' +
                ", resolvedBy='" + resolvedBy + '\'' +
                ", affectedUsers=" + affectedUsers +
                ", actionTaken='" + actionTaken + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}
