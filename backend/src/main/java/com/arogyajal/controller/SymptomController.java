package com.arogyajal.controller;

import com.arogyajal.dto.SymptomRequest;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.service.AlertService;
import com.arogyajal.service.SymptomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/symptoms")
@Tag(name = "Symptom Controller", description = "APIs for managing symptom reports")
public class SymptomController {
    
    private static final Logger log = LoggerFactory.getLogger(SymptomController.class);
    
    private final SymptomService symptomService;
    private final AlertService alertService;

    public SymptomController(SymptomService symptomService, AlertService alertService) {
        this.symptomService = symptomService;
        this.alertService = alertService;
    }
    
    @PostMapping("/reports")
    @Operation(summary = "Create a new symptom report", description = "Submit a new symptom report")
    public ResponseEntity<SymptomReport> createSymptomReport(@Valid @RequestBody SymptomRequest request) {
        log.info("Creating symptom report for user: {}", request.getUserId());
        
        SymptomReport report = symptomService.saveSymptomReport(request);
        
        // Check for symptom cluster alerts after saving the report
        alertService.checkForSymptomClusterAlerts(request.getLocation());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }
    
    @GetMapping("/reports")
    @Operation(summary = "Get all symptom reports", description = "Retrieve all symptom reports")
    public ResponseEntity<List<SymptomReport>> getAllSymptomReports() {
        log.info("Retrieving all symptom reports");
        List<SymptomReport> reports = symptomService.getAllSymptomReports();
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/{id}")
    @Operation(summary = "Get symptom report by ID", description = "Retrieve a specific symptom report by its ID")
    public ResponseEntity<SymptomReport> getSymptomReportById(
            @Parameter(description = "Symptom report ID") @PathVariable String id) {
        log.info("Retrieving symptom report by ID: {}", id);
        
        Optional<SymptomReport> report = symptomService.getSymptomReportById(id);
        return report.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/reports/user/{userId}")
    @Operation(summary = "Get reports by user ID", description = "Retrieve all reports for a specific user")
    public ResponseEntity<List<SymptomReport>> getReportsByUserId(
            @Parameter(description = "User ID") @PathVariable String userId) {
        log.info("Retrieving reports for user: {}", userId);
        
        List<SymptomReport> reports = symptomService.getReportsByUserId(userId);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/location/{location}")
    @Operation(summary = "Get reports by location", description = "Retrieve all reports for a specific location")
    public ResponseEntity<List<SymptomReport>> getReportsByLocation(
            @Parameter(description = "Location name") @PathVariable String location) {
        log.info("Retrieving reports for location: {}", location);
        
        List<SymptomReport> reports = symptomService.getReportsByLocation(location);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/status/{status}")
    @Operation(summary = "Get reports by status", description = "Retrieve reports filtered by status")
    public ResponseEntity<List<SymptomReport>> getReportsByStatus(
            @Parameter(description = "Report status (PENDING, INVESTIGATED, RESOLVED)") @PathVariable String status) {
        log.info("Retrieving reports with status: {}", status);
        
        List<SymptomReport> reports = symptomService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/severity/{severity}")
    @Operation(summary = "Get reports by severity", description = "Retrieve reports filtered by severity")
    public ResponseEntity<List<SymptomReport>> getReportsBySeverity(
            @Parameter(description = "Severity level (MILD, MODERATE, SEVERE)") @PathVariable String severity) {
        log.info("Retrieving reports with severity: {}", severity);
        
        List<SymptomReport> reports = symptomService.getReportsBySeverity(severity);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/time-range")
    @Operation(summary = "Get reports by time range", description = "Retrieve reports within a specific time range")
    public ResponseEntity<List<SymptomReport>> getReportsByTimeRange(
            @Parameter(description = "Start time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("Retrieving reports between {} and {}", start, end);
        
        List<SymptomReport> reports = symptomService.getReportsByTimeRange(start, end);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/location/{location}/time-range")
    @Operation(summary = "Get reports by location and time range", description = "Retrieve reports for a location within a specific time range")
    public ResponseEntity<List<SymptomReport>> getReportsByLocationAndTimeRange(
            @Parameter(description = "Location name") @PathVariable String location,
            @Parameter(description = "Start time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End time") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("Retrieving reports for location {} between {} and {}", location, start, end);
        
        List<SymptomReport> reports = symptomService.getReportsByLocationAndTimeRange(location, start, end);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/symptoms")
    @Operation(summary = "Get reports by symptoms", description = "Retrieve reports containing specific symptoms")
    public ResponseEntity<List<SymptomReport>> getReportsBySymptoms(
            @Parameter(description = "List of symptoms") @RequestParam List<String> symptoms) {
        log.info("Retrieving reports with symptoms: {}", symptoms);
        
        List<SymptomReport> reports = symptomService.getReportsBySymptoms(symptoms);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/location/{location}/symptoms")
    @Operation(summary = "Get reports by location and symptoms", description = "Retrieve reports for a location containing specific symptoms")
    public ResponseEntity<List<SymptomReport>> getReportsByLocationAndSymptoms(
            @Parameter(description = "Location name") @PathVariable String location,
            @Parameter(description = "List of symptoms") @RequestParam List<String> symptoms) {
        log.info("Retrieving reports for location {} with symptoms: {}", location, symptoms);
        
        List<SymptomReport> reports = symptomService.getReportsByLocationAndSymptoms(location, symptoms);
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/reports/high-severity/recent")
    @Operation(summary = "Get high severity recent reports", description = "Retrieve high severity reports from the last 24 hours")
    public ResponseEntity<List<SymptomReport>> getHighSeverityRecentReports(
            @Parameter(description = "Hours to look back") @RequestParam(defaultValue = "24") int hours) {
        log.info("Retrieving high severity reports from last {} hours", hours);
        
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<SymptomReport> reports = symptomService.getHighSeverityRecentReports(since);
        return ResponseEntity.ok(reports);
    }
    
    @PutMapping("/reports/{id}/status")
    @Operation(summary = "Update report status", description = "Update the status of a symptom report")
    public ResponseEntity<SymptomReport> updateReportStatus(
            @Parameter(description = "Report ID") @PathVariable String id,
            @Parameter(description = "New status") @RequestParam String status,
            @Parameter(description = "Investigation notes") @RequestParam(required = false) String investigationNotes) {
        log.info("Updating report {} status to: {}", id, status);
        
        try {
            SymptomReport report = symptomService.updateReportStatus(id, status, investigationNotes);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get symptom report statistics", description = "Retrieve statistics about symptom reports")
    public ResponseEntity<SymptomStatisticsResponse> getSymptomStatistics() {
        log.info("Retrieving symptom report statistics");
        
        SymptomStatisticsResponse response = new SymptomStatisticsResponse();
        response.totalReports = symptomService.getReportCount();
        response.pendingReports = symptomService.getReportCountByStatus("PENDING");
        response.resolvedReports = symptomService.getReportCountByStatus("RESOLVED");
        response.severeReports = symptomService.getReportCountBySeverity("SEVERE");
        response.distinctLocations = symptomService.getDistinctLocations();
        response.distinctSymptoms = symptomService.getDistinctSymptoms();
        
        return ResponseEntity.ok(response);
    }
    
    // Response class
    public static class SymptomStatisticsResponse {
        public long totalReports;
        public long pendingReports;
        public long resolvedReports;
        public long severeReports;
        public List<String> distinctLocations;
        public List<String> distinctSymptoms;
    }
}
