package com.healthcare.patient_service.controller;

import com.healthcare.patient_service.dto.*;
import com.healthcare.patient_service.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    
    private final PatientService patientService;
    
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
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
    
    // ==================== PROFILE PICTURE ENDPOINTS ====================
    
    @PostMapping(value = "/{patientId}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientDTO> uploadProfilePicture(
            @PathVariable Long patientId,
            @RequestParam("file") MultipartFile file) {
        System.out.println("POST /api/patients/" + patientId + "/profile-picture");
        PatientDTO updatedPatient = patientService.uploadProfilePicture(patientId, file);
        return ResponseEntity.ok(updatedPatient);
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
//Update document 
 @PutMapping(value = "/{patientId}/documents/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicalDocumentDTO> updateDocument(
            @PathVariable Long patientId,
            @PathVariable Long documentId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestHeader(value = "X-User-Id", required = false) String uploadedBy) {
        
        System.out.println("========== UPDATE DOCUMENT REQUEST ==========");
        System.out.println("PUT /api/patients/" + patientId + "/documents/" + documentId);
        System.out.println("File provided: " + (file != null && !file.isEmpty()));
        System.out.println("Document Type: " + documentType);
        System.out.println("Description: " + description);
        System.out.println("Notes: " + notes);
        
        String uploader = uploadedBy != null ? "PATIENT:" + uploadedBy : "PATIENT:" + patientId;
        MedicalDocumentDTO document = patientService.updateDocument(
            patientId, documentId, file, documentType, description, notes, uploader);
        
        System.out.println("========== UPDATE DOCUMENT COMPLETED ==========");
        return ResponseEntity.ok(document);
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

// Get all medical history records
@GetMapping("/{patientId}/medical-history/all")
public ResponseEntity<List<MedicalHistoryDTO>> getAllMedicalHistory(@PathVariable Long patientId) {
    System.out.println("GET /api/patients/" + patientId + "/medical-history/all");
    List<MedicalHistoryDTO> historyList = patientService.getAllMedicalHistoryRecords(patientId);
    return ResponseEntity.ok(historyList);
}

// Get medical history by type
@GetMapping("/{patientId}/medical-history/type/{historyType}")
public ResponseEntity<List<MedicalHistoryDTO>> getMedicalHistoryByType(
        @PathVariable Long patientId,
        @PathVariable String historyType) {
    System.out.println("GET /api/patients/" + patientId + "/medical-history/type/" + historyType);
    List<MedicalHistoryDTO> historyList = patientService.getMedicalHistoryByType(patientId, historyType);
    return ResponseEntity.ok(historyList);
}

// Add medical history record
@PostMapping("/{patientId}/medical-history")
public ResponseEntity<MedicalHistoryDTO> addMedicalHistory(
        @PathVariable Long patientId,
        @Valid @RequestBody MedicalHistoryRequest request) {
    System.out.println("POST /api/patients/" + patientId + "/medical-history");
    MedicalHistoryDTO history = patientService.addMedicalHistory(patientId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(history);
}

// Update medical history record
@PutMapping("/medical-history/{historyId}")
public ResponseEntity<MedicalHistoryDTO> updateMedicalHistory(
        @PathVariable Long historyId,
        @Valid @RequestBody MedicalHistoryRequest request) {
    System.out.println("PUT /api/patients/medical-history/" + historyId);
    MedicalHistoryDTO history = patientService.updateMedicalHistory(historyId, request);
    return ResponseEntity.ok(history);
}

// Delete medical history record
@DeleteMapping("/medical-history/{historyId}")
public ResponseEntity<Void> deleteMedicalHistory(@PathVariable Long historyId) {
    System.out.println("DELETE /api/patients/medical-history/" + historyId);
    patientService.deleteMedicalHistory(historyId);
    return ResponseEntity.noContent().build();
}
    
    // ==================== DELETE ENDPOINTS ====================
    
    @DeleteMapping("/{patientId}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long patientId,
            @PathVariable Long documentId) {
        System.out.println("DELETE /api/patients/" + patientId + "/documents/" + documentId);
        patientService.deleteDocument(patientId, documentId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{patientId}/documents/all")
    public ResponseEntity<Void> deleteAllDocuments(@PathVariable Long patientId) {
        System.out.println("DELETE /api/patients/" + patientId + "/documents/all");
        patientService.deleteAllDocuments(patientId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{patientId}/account")
    public ResponseEntity<Void> deletePatientAccount(@PathVariable Long patientId) {
        System.out.println("DELETE /api/patients/" + patientId + "/account");
        patientService.deletePatientAccount(patientId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{patientId}/account/permanent")
    public ResponseEntity<Void> permanentlyDeleteOwnAccount(@PathVariable Long patientId) {
        System.out.println("DELETE /api/patients/" + patientId + "/account/permanent");
        patientService.permanentlyDeletePatient(patientId);
        return ResponseEntity.noContent().build();
    }

    // ==================== INTERNAL PRESCRIPTION SYNC ====================

    /**
     * Internal endpoint used by doctor-service to write prescriptions into patient-service DB.
     * Not intended for direct end-user usage.
     */
    @PostMapping("/_internal/prescriptions")
    public ResponseEntity<PrescriptionDTO> upsertPrescription(@RequestBody DoctorPrescriptionUpsertRequest request) {
        System.out.println("POST /api/patients/_internal/prescriptions (upsert) patientId=" + request.getPatientId()
                + ", appointmentId=" + request.getAppointmentId());

        PrescriptionDTO dto = PrescriptionDTO.builder()
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .doctorSpecialty(request.getDoctorSpecialty())
                .appointmentId(request.getAppointmentId())
                .prescriptionDate(request.getPrescriptionDate())
                .validUntil(request.getValidUntil())
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .isActive(request.isActive())
                .isFulfilled(request.isFulfilled())
                .medications(request.getMedications() != null
                        ? request.getMedications().stream()
                        .map(m -> PrescriptionMedicationDTO.builder()
                                .medicationName(m.getMedicationName())
                                .dosage(m.getDosage())
                                .frequency(m.getFrequency())
                                .duration(m.getDuration())
                                .timing(m.getTiming())
                                .instructions(m.getInstructions())
                                .quantity(m.getQuantity())
                                .refillInfo(m.getRefillInfo())
                                .build())
                        .toList()
                        : java.util.List.of())
                .build();

        PrescriptionDTO saved = patientService.upsertPrescriptionFromDoctor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
