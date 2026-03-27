package com.healthcare.patient_service.controller;

import com.healthcare.patient_service.dto.PatientDTO;
import com.healthcare.patient_service.dto.PatientStatsDTO;
import com.healthcare.patient_service.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller - For administrative operations
 * 
 * Endpoints:
 * - GET /api/admin/patients - Get all patients
 * - GET /api/admin/patients/{patientId} - Get patient details by ID
 * - GET /api/admin/patients/search?name={name} - Search patients by name
 * - PUT /api/admin/patients/{patientId}/status?active={true/false} - Activate/Deactivate patient
 * - GET /api/admin/patients/stats - Get patient statistics
 * - GET /api/admin/patients/count - Get total patient count
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final PatientService patientService;
    
    public AdminController(PatientService patientService) {
        this.patientService = patientService;
    }
    
    /**
     * Get all patients (Admin only)
     */
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        System.out.println("GET /api/admin/patients - Admin: Get all patients");
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }
    
    /**
     * Get patient by ID (Admin view)
     */
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long patientId) {
        System.out.println("GET /api/admin/patients/" + patientId);
        PatientDTO patient = patientService.getPatientProfile(patientId);
        return ResponseEntity.ok(patient);
    }
    
    /**
     * Search patients by name (Admin)
     */
    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientDTO>> searchPatients(@RequestParam String name) {
        System.out.println("GET /api/admin/patients/search?name=" + name);
        List<PatientDTO> patients = patientService.searchPatientsByName(name);
        return ResponseEntity.ok(patients);
    }
    
    /**
     * Activate/Deactivate patient account (Admin)
     */
    @PutMapping("/patients/{patientId}/status")
    public ResponseEntity<PatientDTO> updatePatientStatus(
            @PathVariable Long patientId,
            @RequestParam boolean active) {
        System.out.println("PUT /api/admin/patients/" + patientId + "/status?active=" + active);
        PatientDTO patient = patientService.updatePatientStatus(patientId, active);
        return ResponseEntity.ok(patient);
    }
    
    /**
     * Get patient statistics (Admin dashboard)
     */
    @GetMapping("/patients/stats")
    public ResponseEntity<PatientStatsDTO> getPatientStats() {
        System.out.println("GET /api/admin/patients/stats");
        PatientStatsDTO stats = patientService.getPatientStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get total patient count
     */
    @GetMapping("/patients/count")
    public ResponseEntity<Map<String, Long>> getPatientCount() {
        System.out.println("GET /api/admin/patients/count");
        long count = patientService.getPatientCount();
        return ResponseEntity.ok(Map.of("totalPatients", count));
    }

/**
 * Permanently delete patient (Admin only)
 */
@DeleteMapping("/patients/{patientId}/permanent")
public ResponseEntity<Void> permanentlyDeletePatient(@PathVariable Long patientId) {
    System.out.println("DELETE /api/admin/patients/" + patientId + "/permanent");
    patientService.permanentlyDeletePatient(patientId);
    return ResponseEntity.noContent().build();
}

/**
 * Delete all documents for a patient (Admin only)
 */
@DeleteMapping("/patients/{patientId}/documents")
public ResponseEntity<Void> deleteAllPatientDocuments(@PathVariable Long patientId) {
    System.out.println("DELETE /api/admin/patients/" + patientId + "/documents");
    patientService.deleteAllDocuments(patientId);
    return ResponseEntity.noContent().build();
}
}