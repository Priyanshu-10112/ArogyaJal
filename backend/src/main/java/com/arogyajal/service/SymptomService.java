package com.arogyajal.service;

import com.arogyajal.dto.SymptomRequest;
import com.arogyajal.model.SymptomReport;
import com.arogyajal.repository.SymptomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SymptomService {
    
    private static final Logger log = LoggerFactory.getLogger(SymptomService.class);
    
    private final SymptomRepository symptomRepository;

    public SymptomService(SymptomRepository symptomRepository) {
        this.symptomRepository = symptomRepository;
    }
    
    public SymptomReport saveSymptomReport(SymptomRequest request) {
        log.info("Saving symptom report for user ID: {}", request.getUserId());
        
        try {
            // Generate a new ID for the report
            String reportId = UUID.randomUUID().toString();
            
            SymptomReport report = SymptomReport.builder()
                    .id(reportId)
                    .userId(request.getUserId())
                    .location(request.getLocation())
                    .waterSource(request.getWaterSource())
                    .symptoms(request.getSymptoms())
                    .severity(request.getSeverity())
                    .duration(request.getDuration())
                    .waterConsumption(request.getWaterConsumption())
                    .lastWaterConsumption(LocalDateTime.now())
                    .additionalNotes(request.getAdditionalNotes())
                    .contactInfo(request.getContactInfo())
                    .reportedAt(LocalDateTime.now())
                    .status("PENDING")
                    .build();
            
            return symptomRepository.save(report);
        } catch (Exception e) {
            log.error("Error saving symptom report for user ID: {}", request.getUserId(), e);
            throw new RuntimeException("Failed to save symptom report", e);
        }
    }
    
    public List<SymptomReport> getAllSymptomReports() {
        log.info("Retrieving all symptom reports");
        return symptomRepository.findAll();
    }
    
    public Optional<SymptomReport> getSymptomReportById(String id) {
        log.info("Retrieving symptom report by ID: {}", id);
        return symptomRepository.findById(id);
    }
    
    public List<SymptomReport> getReportsByUserId(String userId) {
        log.info("Retrieving reports for user ID: {}", userId);
        return symptomRepository.findByUserIdOrderByReportedAtDesc(userId);
    }
    
    public List<SymptomReport> getReportsByLocation(String location) {
        log.info("Retrieving reports for location: {}", location);
        return symptomRepository.findByLocationOrderByReportedAtDesc(location);
    }
    
    public List<SymptomReport> getReportsByStatus(String status) {
        log.info("Retrieving reports with status: {}", status);
        return symptomRepository.findByStatusOrderByReportedAtDesc(status);
    }
    
    public List<SymptomReport> getReportsBySeverity(String severity) {
        log.info("Retrieving reports with severity: {}", severity);
        return symptomRepository.findBySeverityOrderByReportedAtDesc(severity);
    }
    
    public List<SymptomReport> getReportsByTimeRange(LocalDateTime start, LocalDateTime end) {
        log.info("Retrieving reports between {} and {}", start, end);
        return symptomRepository.findByReportedAtBetweenOrderByReportedAtDesc(start, end);
    }
    
    public List<SymptomReport> getReportsByLocationAndTimeRange(String location, LocalDateTime start, LocalDateTime end) {
        log.info("Retrieving reports for location {} between {} and {}", location, start, end);
        return symptomRepository.findByLocationAndReportedAtBetweenOrderByReportedAtDesc(location, start, end);
    }
    
    public List<SymptomReport> getReportsBySymptoms(List<String> symptoms) {
        try {
            List<SymptomReport> reports = new ArrayList<>();
            for (String symptom : symptoms) {
                reports.addAll(symptomRepository.findBySymptomsContaining(symptom));
            }
            return reports;
        } catch (Exception e) {
            log.error("Error fetching reports by symptoms", e);
            return Collections.emptyList();
        }
    }
    
    public List<SymptomReport> getReportsByLocationAndSymptoms(String location, List<String> symptoms) {
        try {
            List<SymptomReport> reports = new ArrayList<>();
            for (String symptom : symptoms) {
                List<SymptomReport> locationReports = symptomRepository.findByLocation(location);
                for (SymptomReport report : locationReports) {
                    if (report.getSymptoms() != null && report.getSymptoms().contains(symptom)) {
                        reports.add(report);
                    }
                }
            }
            return reports;
        } catch (Exception e) {
            log.error("Error fetching reports by location and symptoms", e);
            return Collections.emptyList();
        }
    }
    
    public List<SymptomReport> getHighSeverityRecentReports(LocalDateTime since) {
        log.info("Retrieving high severity reports since: {}", since);
        return symptomRepository.findHighSeverityRecentReports(since);
    }
    
    public SymptomReport updateReportStatus(String id, String status, String investigationNotes) {
        log.info("Updating report {} status to: {}", id, status);
        
        Optional<SymptomReport> reportOpt = symptomRepository.findById(id);
        if (reportOpt.isPresent()) {
            SymptomReport report = reportOpt.get();
            report.setStatus(status);
            report.setInvestigationNotes(investigationNotes);
            report.setInvestigatedAt(LocalDateTime.now());
            return symptomRepository.save(report);
        }
        throw new RuntimeException("Symptom report not found with ID: " + id);
    }
    
    public long getReportCount() {
        return symptomRepository.count();
    }
    
    public long getReportCountByStatus(String status) {
        return symptomRepository.countByStatus(status);
    }
    
    public long getReportCountByLocation(String location) {
        return symptomRepository.countByLocation(location);
    }
    
    public long getReportCountBySeverity(String severity) {
        return symptomRepository.countBySeverity(severity);
    }
    
    public List<String> getDistinctLocations() {
        try {
            return symptomRepository.findDistinctLocations();
        } catch (Exception e) {
            log.error("Error fetching distinct locations", e);
            return Collections.emptyList();
        }
    }
    
    public List<String> getDistinctSymptoms() {
        try {
            return symptomRepository.findDistinctSymptoms();
        } catch (Exception e) {
            log.error("Error fetching distinct symptoms", e);
            return Collections.emptyList();
        }
    }
    
    public Optional<SymptomReport> getLatestReportByUserId(String userId) {
        return symptomRepository.findFirstByUserIdOrderByReportedAtDesc(userId);
    }
}
