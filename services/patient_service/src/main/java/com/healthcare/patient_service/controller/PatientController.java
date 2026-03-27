package com.healthcare.patient_service.controller;

import com.healthcare.patient_service.dto.*;
import com.healthcare.patient_service.service.FileStorageService;
import com.healthcare.patient_service.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    
    private final PatientService patientService;
    private final FileStorageService fileStorageService;
    
    public PatientController(PatientService patientService, FileStorageService fileStorageService) {
        this.patientService = patientService;
        this.fileStorageService = fileStorageService;
    }
    
    // ==================== PATIENT REGISTRATION ====================
    
    @PostMapping("/register")
    public ResponseEntity<PatientDTO> registerPatient(@Valid @RequestBody PatientRegistrationRequest request) {
        System.out.println("POST /api/patients/register");
        PatientDTO patient = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(patient);
    }
    
    // ==================== PATIENT PROFILE ENDPOINTS ====================
    
    @GetMapping("/{patientId}/profile")
    public ResponseEntity<PatientDTO> getProfile(@PathVariable Long patientId) {
        System.out.println("GET /api/patients/" + patientId + "/profile");
        PatientDTO profile = patientService.getPatientProfile(patientId);
        return ResponseEntity.ok(profile);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<PatientDTO> getProfileByUserId(@PathVariable Long userId) {
        System.out.println("GET /api/patients/user/" + userId);
        PatientDTO profile = patientService.getPatientProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/{patientId}/profile")
    public ResponseEntity<PatientDTO> updateProfile(
            @PathVariable Long patientId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        System.out.println("PUT /api/patients/" + patientId + "/profile");
        PatientDTO updated = patientService.updateProfile(patientId, request);
        return ResponseEntity.ok(updated);
    }
    
    // ==================== DOCUMENT ENDPOINTS ====================
    
    @PostMapping(value = "/{patientId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalDocumentDTO> uploadDocument(
            @PathVariable Long patientId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestHeader(value = "X-User-Id", required = false) String uploadedBy) {
        
        System.out.println("POST /api/patients/" + patientId + "/documents - Type: " + documentType);
        
        String uploader = uploadedBy != null ? "PATIENT:" + uploadedBy : "PATIENT:" + patientId;
        MedicalDocumentDTO document = patientService.uploadDocument(
            patientId, file, documentType, description, notes, uploader);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }
    
    @GetMapping("/{patientId}/documents")
    public ResponseEntity<List<MedicalDocumentDTO>> getDocuments(@PathVariable Long patientId) {
        System.out.println("GET /api/patients/" + patientId + "/documents");
        List<MedicalDocumentDTO> documents = patientService.getPatientDocuments(patientId);
        return ResponseEntity.ok(documents);
    }
    
    @GetMapping("/{patientId}/documents/{fileName}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long patientId,
            @PathVariable String fileName) {
        
        System.out.println("GET /api/patients/" + patientId + "/documents/" + fileName);
        
        try {
            Path filePath = fileStorageService.getFilePath(patientId, fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + fileName + "\"")
                .body(resource);
                
        } catch (MalformedURLException e) {
            System.err.println("Error downloading document: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ==================== PRESCRIPTION ENDPOINTS ====================
    
    @GetMapping("/{patientId}/prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptions(@PathVariable Long patientId) {
        System.out.println("GET /api/patients/" + patientId + "/prescriptions");
        List<PrescriptionDTO> prescriptions = patientService.getPatientPrescriptions(patientId);
        return ResponseEntity.ok(prescriptions);
    }
    
    // ==================== MEDICAL HISTORY ENDPOINTS ====================
    
    @GetMapping("/{patientId}/medical-history")
    public ResponseEntity<MedicalHistoryDTO> getMedicalHistory(@PathVariable Long patientId) {
        System.out.println("GET /api/patients/" + patientId + "/medical-history");
        MedicalHistoryDTO history = patientService.getMedicalHistory(patientId);
        return ResponseEntity.ok(history);
    }


// ==================== DELETE ENDPOINTS ====================

/**
 * Delete a specific document (Patient can delete their own documents)
 * 
 * @param patientId - Patient ID
 * @param documentId - Document ID to delete
 * @return 204 No Content on success
 */
@DeleteMapping("/{patientId}/documents/{documentId}")
public ResponseEntity<Void> deleteDocument(
        @PathVariable Long patientId,
        @PathVariable Long documentId) {
    System.out.println("DELETE /api/patients/" + patientId + "/documents/" + documentId);
    patientService.deleteDocument(patientId, documentId);
    return ResponseEntity.noContent().build();
}

/**
 * Delete all documents for a patient (Admin only)
 * 
 * @param patientId - Patient ID
 * @return 204 No Content on success
 */
@DeleteMapping("/{patientId}/documents/all")
public ResponseEntity<Void> deleteAllDocuments(@PathVariable Long patientId) {
    System.out.println("DELETE /api/patients/" + patientId + "/documents/all");
    patientService.deleteAllDocuments(patientId);
    return ResponseEntity.noContent().build();
}

/**
 * Delete patient account (Soft delete - deactivate account)
 * 
 * @param patientId - Patient ID
 * @return 204 No Content on success
 */
@DeleteMapping("/{patientId}/account")
public ResponseEntity<Void> deletePatientAccount(@PathVariable Long patientId) {
    System.out.println("DELETE /api/patients/" + patientId + "/account");
    patientService.deletePatientAccount(patientId);
    return ResponseEntity.noContent().build();
}

/**
 * Hard delete patient account (Admin only - permanently remove from database)
 * 
 * @param patientId - Patient ID
 * @return 204 No Content on success
 */
@DeleteMapping("/admin/{patientId}/permanent")
public ResponseEntity<Void> permanentlyDeletePatient(@PathVariable Long patientId) {
    System.out.println("DELETE /api/patients/admin/" + patientId + "/permanent");
    patientService.permanentlyDeletePatient(patientId);
    return ResponseEntity.noContent().build();
}
}