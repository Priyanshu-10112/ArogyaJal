package com.arogyajal.controller;

import com.arogyajal.model.SymptomCluster;
import com.arogyajal.service.SymptomClusterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller for Symptom Clusters.
 * Provides endpoints for symptom clustering analysis.
 */
@RestController
@RequestMapping("/api/clusters")
@CrossOrigin(origins = "*")
public class SymptomClusterController {

    private final SymptomClusterService clusterService;

    public SymptomClusterController(SymptomClusterService clusterService) {
        this.clusterService = clusterService;
    }

    /**
     * Create a new symptom cluster
     * POST /api/clusters
     */
    @PostMapping
    public ResponseEntity<?> createCluster(@RequestBody SymptomCluster cluster) {
        try {
            SymptomCluster created = clusterService.createCluster(cluster);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create cluster: " + e.getMessage()));
        }
    }

    /**
     * Get cluster by ID
     * GET /api/clusters/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getClusterById(@PathVariable String id) {
        try {
            SymptomCluster cluster = clusterService.getClusterById(id);
            return ResponseEntity.ok(cluster);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve cluster: " + e.getMessage()));
        }
    }

    /**
     * Get all clusters
     * GET /api/clusters
     */
    @GetMapping
    public ResponseEntity<?> getAllClusters() {
        try {
            List<SymptomCluster> clusters = clusterService.getAllClusters();
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters: " + e.getMessage()));
        }
    }

    /**
     * Get clusters by location
     * GET /api/clusters/location/{location}
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<?> getClustersByLocation(@PathVariable String location) {
        try {
            List<SymptomCluster> clusters = clusterService.getClustersByLocation(location);
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters: " + e.getMessage()));
        }
    }

    /**
     * Get active clusters
     * GET /api/clusters/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveClusters() {
        try {
            List<SymptomCluster> clusters = clusterService.getActiveClusters();
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve active clusters: " + e.getMessage()));
        }
    }

    /**
     * Get active clusters by location
     * GET /api/clusters/location/{location}/active
     */
    @GetMapping("/location/{location}/active")
    public ResponseEntity<?> getActiveClustersByLocation(@PathVariable String location) {
        try {
            List<SymptomCluster> clusters = clusterService.getActiveClustersByLocation(location);
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve active clusters: " + e.getMessage()));
        }
    }

    /**
     * Get high-severity clusters
     * GET /api/clusters/high-severity
     */
    @GetMapping("/high-severity")
    public ResponseEntity<?> getHighSeverityClusters() {
        try {
            List<SymptomCluster> clusters = clusterService.getHighSeverityClusters();
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve high-severity clusters: " + e.getMessage()));
        }
    }

    /**
     * Get clusters by severity
     * GET /api/clusters/severity/{severity}
     */
    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getClustersBySeverity(@PathVariable String severity) {
        try {
            List<SymptomCluster> clusters = clusterService.getClustersBySeverity(severity);
            return ResponseEntity.ok(clusters);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters: " + e.getMessage()));
        }
    }

    /**
     * Get clusters by detection method
     * GET /api/clusters/detection-method/{method}
     */
    @GetMapping("/detection-method/{method}")
    public ResponseEntity<?> getClustersByDetectionMethod(@PathVariable String method) {
        try {
            List<SymptomCluster> clusters = clusterService.getClustersByDetectionMethod(method);
            return ResponseEntity.ok(clusters);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters: " + e.getMessage()));
        }
    }

    /**
     * Get clusters with alerts
     * GET /api/clusters/alerts
     */
    @GetMapping("/alerts")
    public ResponseEntity<?> getClustersWithAlerts() {
        try {
            List<SymptomCluster> clusters = clusterService.getClustersWithAlerts();
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters with alerts: " + e.getMessage()));
        }
    }

    /**
     * Get clusters by water source
     * GET /api/clusters/water-source/{waterSource}
     */
    @GetMapping("/water-source/{waterSource}")
    public ResponseEntity<?> getClustersByWaterSource(@PathVariable String waterSource) {
        try {
            List<SymptomCluster> clusters = clusterService.getClustersByWaterSource(waterSource);
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve clusters: " + e.getMessage()));
        }
    }

    /**
     * Get high-score clusters
     * GET /api/clusters/high-score
     */
    @GetMapping("/high-score")
    public ResponseEntity<?> getHighScoreClusters(@RequestParam(defaultValue = "75.0") double minScore) {
        try {
            List<SymptomCluster> clusters = clusterService.getHighScoreClusters(minScore);
            return ResponseEntity.ok(clusters);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve high-score clusters: " + e.getMessage()));
        }
    }

    /**
     * Update cluster
     * PUT /api/clusters/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCluster(@PathVariable String id, @RequestBody SymptomCluster cluster) {
        try {
            cluster = SymptomCluster.builder()
                    .id(id)
                    .location(cluster.getLocation())
                    .centroid(cluster.getCentroid())
                    .radiusKm(cluster.getRadiusKm())
                    .reportCount(cluster.getReportCount())
                    .reportIds(cluster.getReportIds())
                    .firstReportDate(cluster.getFirstReportDate())
                    .lastReportDate(cluster.getLastReportDate())
                    .durationHours(cluster.getDurationHours())
                    .symptomDistribution(cluster.getSymptomDistribution())
                    .dominantSymptoms(cluster.getDominantSymptoms())
                    .severityDistribution(cluster.getSeverityDistribution())
                    .overallSeverity(cluster.getOverallSeverity())
                    .affectedPopulation(cluster.getAffectedPopulation())
                    .ageDistribution(cluster.getAgeDistribution())
                    .genderDistribution(cluster.getGenderDistribution())
                    .waterSourceDistribution(cluster.getWaterSourceDistribution())
                    .primaryWaterSource(cluster.getPrimaryWaterSource())
                    .status(cluster.getStatus())
                    .detectionMethod(cluster.getDetectionMethod())
                    .build();
            
            SymptomCluster updated = clusterService.updateCluster(cluster);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update cluster: " + e.getMessage()));
        }
    }

    /**
     * Update cluster status
     * PATCH /api/clusters/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateClusterStatus(@PathVariable String id, 
                                                 @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            clusterService.updateClusterStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update status: " + e.getMessage()));
        }
    }

    /**
     * Add report to cluster
     * POST /api/clusters/{clusterId}/reports/{reportId}
     */
    @PostMapping("/{clusterId}/reports/{reportId}")
    public ResponseEntity<?> addReportToCluster(@PathVariable String clusterId, 
                                                @PathVariable String reportId) {
        try {
            clusterService.addReportToCluster(clusterId, reportId);
            return ResponseEntity.ok(Map.of("message", "Report added to cluster successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add report to cluster: " + e.getMessage()));
        }
    }

    /**
     * Delete cluster
     * DELETE /api/clusters/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCluster(@PathVariable String id) {
        try {
            clusterService.deleteCluster(id);
            return ResponseEntity.ok(Map.of("message", "Cluster deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete cluster: " + e.getMessage()));
        }
    }

    /**
     * Get cluster statistics by location
     * GET /api/clusters/stats/location/{location}
     */
    @GetMapping("/stats/location/{location}")
    public ResponseEntity<?> getClusterStatsByLocation(@PathVariable String location) {
        try {
            Map<String, Object> stats = clusterService.getClusterStatsByLocation(location);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve statistics: " + e.getMessage()));
        }
    }

    /**
     * Get overall cluster statistics
     * GET /api/clusters/stats/overall
     */
    @GetMapping("/stats/overall")
    public ResponseEntity<?> getOverallStats() {
        try {
            Map<String, Object> stats = clusterService.getOverallStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve statistics: " + e.getMessage()));
        }
    }

    /**
     * Resolve old clusters
     * POST /api/clusters/resolve-old
     */
    @PostMapping("/resolve-old")
    public ResponseEntity<?> resolveOldClusters(@RequestParam(defaultValue = "7") int daysOld) {
        try {
            int resolvedCount = clusterService.resolveOldClusters(daysOld);
            return ResponseEntity.ok(Map.of(
                    "message", "Old clusters resolved successfully",
                    "resolvedCount", resolvedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to resolve old clusters: " + e.getMessage()));
        }
    }
}
