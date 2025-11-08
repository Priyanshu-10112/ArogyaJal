package com.arogyajal.controller;

import com.arogyajal.model.Alert;
import com.arogyajal.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alert API", description = "APIs for managing system alerts and notifications")
public class AlertController {

    private static final Logger log = LoggerFactory.getLogger(AlertController.class);
    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Get all alerts", description = "Retrieve all alerts in the system")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        log.info("Retrieving all alerts");
        try {
            List<Alert> alerts = alertService.getAllAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving all alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert by ID", description = "Retrieve a specific alert by its ID")
    public ResponseEntity<Alert> getAlertById(
            @Parameter(description = "Alert ID") @PathVariable String id) {
        log.info("Retrieving alert by ID: {}", id);
        try {
            return alertService.getAlertById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving alert with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get alerts by status", description = "Retrieve alerts filtered by status (ACTIVE, ACKNOWLEDGED, RESOLVED)")
    public ResponseEntity<List<Alert>> getAlertsByStatus(
            @Parameter(description = "Alert status") @PathVariable String status) {
        log.info("Retrieving alerts with status: {}", status);
        try {
            List<Alert> alerts = alertService.getAlertsByStatus(status.toUpperCase());
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving alerts with status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/severity/{severity}")
    @Operation(summary = "Get alerts by severity", description = "Retrieve alerts filtered by severity (LOW, MEDIUM, HIGH, CRITICAL)")
    public ResponseEntity<List<Alert>> getAlertsBySeverity(
            @Parameter(description = "Alert severity") @PathVariable String severity) {
        log.info("Retrieving alerts with severity: {}", severity);
        try {
            List<Alert> alerts = alertService.getAlertsBySeverity(severity.toUpperCase());
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving alerts with severity: {}", severity, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/location/{location}")
    @Operation(summary = "Get alerts by location", description = "Retrieve alerts for a specific location")
    public ResponseEntity<List<Alert>> getAlertsByLocation(
            @Parameter(description = "Location") @PathVariable String location) {
        log.info("Retrieving alerts for location: {}", location);
        try {
            List<Alert> alerts = alertService.getAlertsByLocation(location);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving alerts for location: {}", location, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    @Operation(summary = "Get active alerts", description = "Retrieve all active alerts")
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        log.info("Retrieving active alerts");
        try {
            List<Alert> alerts = alertService.getActiveAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving active alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/critical")
    @Operation(summary = "Get critical alerts", description = "Retrieve all critical severity alerts")
    public ResponseEntity<List<Alert>> getCriticalAlerts() {
        log.info("Retrieving critical alerts");
        try {
            List<Alert> alerts = alertService.getCriticalAlerts();
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error retrieving critical alerts", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge alert", description = "Mark an alert as acknowledged")
    public ResponseEntity<Alert> acknowledgeAlert(
            @Parameter(description = "Alert ID") @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String userId = body != null ? body.getOrDefault("userId", "system") : "system";
        log.info("Acknowledging alert {} by user {}", id, userId);
        try {
            Alert alert = alertService.acknowledgeAlert(id, userId);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            log.error("Error acknowledging alert: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{id}/resolve")
    @Operation(summary = "Resolve alert", description = "Mark an alert as resolved")
    public ResponseEntity<Alert> resolveAlert(
            @Parameter(description = "Alert ID") @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body) {
        String resolvedBy = body != null ? body.getOrDefault("resolvedBy", "system") : "system";
        String resolutionNotes = body != null ? body.getOrDefault("resolutionNotes", "") : "";
        log.info("Resolving alert {} by user {}", id, resolvedBy);
        try {
            Alert alert = alertService.resolveAlert(id, resolvedBy, resolutionNotes);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            log.error("Error resolving alert: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get alert statistics", description = "Retrieve statistics about alerts")
    public ResponseEntity<Map<String, Object>> getAlertStatistics() {
        log.info("Retrieving alert statistics");
        try {
            Map<String, Object> stats = Map.of(
                    "total", alertService.getAlertCount(),
                    "active", alertService.getAlertCountByStatus("ACTIVE"),
                    "acknowledged", alertService.getAlertCountByStatus("ACKNOWLEDGED"),
                    "resolved", alertService.getAlertCountByStatus("RESOLVED"),
                    "critical", alertService.getAlertCountBySeverity("CRITICAL"),
                    "high", alertService.getAlertCountBySeverity("HIGH"),
                    "medium", alertService.getAlertCountBySeverity("MEDIUM"),
                    "low", alertService.getAlertCountBySeverity("LOW")
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving alert statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @Operation(summary = "Create alert", description = "Create a new alert")
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        log.info("Creating new alert: {}", alert.getTitle());
        try {
            Alert createdAlert = alertService.createAlert(alert);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAlert);
        } catch (Exception e) {
            log.error("Error creating alert", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
