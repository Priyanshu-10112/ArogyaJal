package com.arogyajal.service;

import com.arogyajal.model.OutbreakPrediction;
import com.arogyajal.repository.OutbreakPredictionRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Service for OutbreakPrediction business logic.
 * Handles prediction creation, analysis, and management.
 */
@Service
public class OutbreakPredictionService {

    private final OutbreakPredictionRepository predictionRepository;

    public OutbreakPredictionService(OutbreakPredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    /**
     * Create a new outbreak prediction
     */
    public OutbreakPrediction createPrediction(OutbreakPrediction prediction) throws ExecutionException, InterruptedException {
        // Set timestamps
        Timestamp now = Timestamp.now();
        if (prediction.getCreatedAt() == null) {
            prediction = OutbreakPrediction.builder()
                    .id(prediction.getId() != null ? prediction.getId() : UUID.randomUUID().toString())
                    .location(prediction.getLocation())
                    .riskLevel(prediction.getRiskLevel())
                    .riskScore(prediction.getRiskScore())
                    .confidence(prediction.getConfidence())
                    .predictionHorizon(prediction.getPredictionHorizon())
                    .contributingFactors(prediction.getContributingFactors())
                    .affectedPopulation(prediction.getAffectedPopulation())
                    .recommendedActions(prediction.getRecommendedActions())
                    .status(prediction.getStatus() != null ? prediction.getStatus() : "ACTIVE")
                    .modelVersion(prediction.getModelVersion())
                    .predictedDate(prediction.getPredictedDate())
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        }

        // Validate prediction
        validatePrediction(prediction);

        // Save to repository
        String id = predictionRepository.save(prediction);
        return predictionRepository.findById(id);
    }

    /**
     * Get prediction by ID
     */
    public OutbreakPrediction getPredictionById(String id) throws ExecutionException, InterruptedException {
        OutbreakPrediction prediction = predictionRepository.findById(id);
        if (prediction == null) {
            throw new IllegalArgumentException("Prediction not found with ID: " + id);
        }
        return prediction;
    }

    /**
     * Get all predictions
     */
    public List<OutbreakPrediction> getAllPredictions() throws ExecutionException, InterruptedException {
        return predictionRepository.findAll();
    }

    /**
     * Get predictions by location
     */
    public List<OutbreakPrediction> getPredictionsByLocation(String location) throws ExecutionException, InterruptedException {
        return predictionRepository.findByLocation(location);
    }

    /**
     * Get active predictions for location
     */
    public List<OutbreakPrediction> getActivePredictionsByLocation(String location) throws ExecutionException, InterruptedException {
        return predictionRepository.findActiveByLocation(location);
    }

    /**
     * Get high-risk predictions
     */
    public List<OutbreakPrediction> getHighRiskPredictions() throws ExecutionException, InterruptedException {
        return predictionRepository.findHighRiskPredictions();
    }

    /**
     * Get predictions by risk level
     */
    public List<OutbreakPrediction> getPredictionsByRiskLevel(String riskLevel) throws ExecutionException, InterruptedException {
        validateRiskLevel(riskLevel);
        return predictionRepository.findByRiskLevel(riskLevel);
    }

    /**
     * Update prediction status
     */
    public void updatePredictionStatus(String id, String status) throws ExecutionException, InterruptedException {
        validateStatus(status);
        
        // Verify prediction exists
        //OutbreakPrediction prediction = getPredictionById(id);
        
        // Update status
        predictionRepository.updateStatus(id, status);
    }

    /**
     * Update prediction
     */
    public OutbreakPrediction updatePrediction(OutbreakPrediction prediction) throws ExecutionException, InterruptedException {
        // Verify prediction exists
        OutbreakPrediction existing = getPredictionById(prediction.getId());
        
        // Validate updated prediction
        validatePrediction(prediction);
        
        // Update timestamp
        prediction = OutbreakPrediction.builder()
                .id(prediction.getId())
                .location(prediction.getLocation())
                .riskLevel(prediction.getRiskLevel())
                .riskScore(prediction.getRiskScore())
                .confidence(prediction.getConfidence())
                .predictionHorizon(prediction.getPredictionHorizon())
                .contributingFactors(prediction.getContributingFactors())
                .affectedPopulation(prediction.getAffectedPopulation())
                .recommendedActions(prediction.getRecommendedActions())
                .status(prediction.getStatus())
                .modelVersion(prediction.getModelVersion())
                .predictedDate(prediction.getPredictedDate())
                .createdAt(existing.getCreatedAt())
                .updatedAt(Timestamp.now())
                .build();
        
        predictionRepository.update(prediction);
        return predictionRepository.findById(prediction.getId());
    }

    /**
     * Delete prediction
     */
    public void deletePrediction(String id) throws ExecutionException, InterruptedException {
        // Verify prediction exists
        getPredictionById(id);
        
        predictionRepository.delete(id);
    }

    /**
     * Get prediction statistics by location
     */
    public Map<String, Object> getPredictionStatsByLocation(String location) throws ExecutionException, InterruptedException {
        List<OutbreakPrediction> predictions = predictionRepository.findActiveByLocation(location);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPredictions", predictions.size());
        stats.put("highRiskCount", predictions.stream()
                .filter(p -> "HIGH".equals(p.getRiskLevel()) || "CRITICAL".equals(p.getRiskLevel()))
                .count());
        stats.put("averageRiskScore", predictions.stream()
                .mapToDouble(OutbreakPrediction::getRiskScore)
                .average()
                .orElse(0.0));
        stats.put("averageConfidence", predictions.stream()
                .mapToDouble(OutbreakPrediction::getConfidence)
                .average()
                .orElse(0.0));
        
        // Risk level distribution
        Map<String, Long> riskDistribution = predictions.stream()
                .collect(Collectors.groupingBy(OutbreakPrediction::getRiskLevel, Collectors.counting()));
        stats.put("riskDistribution", riskDistribution);
        
        return stats;
    }

    /**
     * Get overall prediction statistics
     */
    public Map<String, Object> getOverallStats() throws ExecutionException, InterruptedException {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("lowRiskCount", predictionRepository.countByRiskLevel("LOW"));
        stats.put("mediumRiskCount", predictionRepository.countByRiskLevel("MEDIUM"));
        stats.put("highRiskCount", predictionRepository.countByRiskLevel("HIGH"));
        stats.put("criticalRiskCount", predictionRepository.countByRiskLevel("CRITICAL"));
        
        List<OutbreakPrediction> allPredictions = predictionRepository.findAll();
        stats.put("totalPredictions", allPredictions.size());
        
        long activeCount = allPredictions.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();
        stats.put("activePredictions", activeCount);
        
        return stats;
    }

    /**
     * Archive old predictions
     */
    public int archiveOldPredictions(int daysOld) throws ExecutionException, InterruptedException {
        List<OutbreakPrediction> allPredictions = predictionRepository.findAll();
        Timestamp cutoffDate = Timestamp.ofTimeSecondsAndNanos(
                Timestamp.now().getSeconds() - (daysOld * 24 * 60 * 60), 0);
        
        int archivedCount = 0;
        for (OutbreakPrediction prediction : allPredictions) {
            if ("ACTIVE".equals(prediction.getStatus()) && 
                prediction.getCreatedAt().compareTo(cutoffDate) < 0) {
                predictionRepository.updateStatus(prediction.getId(), "ARCHIVED");
                archivedCount++;
            }
        }
        
        return archivedCount;
    }

    /**
     * Validate prediction data
     */
    private void validatePrediction(OutbreakPrediction prediction) {
        if (prediction.getLocation() == null || prediction.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("Location is required");
        }
        
        if (prediction.getRiskLevel() == null) {
            throw new IllegalArgumentException("Risk level is required");
        }
        validateRiskLevel(prediction.getRiskLevel());
        
        if (prediction.getRiskScore() == null || prediction.getRiskScore() < 0 || prediction.getRiskScore() > 100) {
            throw new IllegalArgumentException("Risk score must be between 0 and 100");
        }
        
        if (prediction.getConfidence() == null || prediction.getConfidence() < 0 || prediction.getConfidence() > 100) {
            throw new IllegalArgumentException("Confidence must be between 0 and 100");
        }
        
        if (prediction.getPredictionHorizon() != null && prediction.getPredictionHorizon() < 1) {
            throw new IllegalArgumentException("Prediction horizon must be at least 1 day");
        }
    }

    /**
     * Validate risk level
     */
    private void validateRiskLevel(String riskLevel) {
        List<String> validLevels = Arrays.asList("LOW", "MEDIUM", "HIGH", "CRITICAL");
        if (!validLevels.contains(riskLevel)) {
            throw new IllegalArgumentException("Invalid risk level. Must be one of: " + validLevels);
        }
    }

    /**
     * Validate status
     */
    private void validateStatus(String status) {
        List<String> validStatuses = Arrays.asList("ACTIVE", "RESOLVED", "ARCHIVED", "EXPIRED");
        if (!validStatuses.contains(status)) {
            throw new IllegalArgumentException("Invalid status. Must be one of: " + validStatuses);
        }
    }
}
