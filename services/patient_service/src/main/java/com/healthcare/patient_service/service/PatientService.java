package com.healthcare.patient_service.service;

import com.healthcare.patient_service.dto.*;
import com.healthcare.patient_service.exception.DocumentUploadException;
import com.healthcare.patient_service.exception.DuplicateResourceException;
import com.healthcare.patient_service.exception.PatientNotFoundException;
import com.healthcare.patient_service.model.MedicalDocument;
import com.healthcare.patient_service.model.MedicalHistory;
import com.healthcare.patient_service.model.Patient;
import com.healthcare.patient_service.model.Prescription;
import com.healthcare.patient_service.repository.MedicalDocumentRepository;
import com.healthcare.patient_service.repository.MedicalHistoryRepository;
import com.healthcare.patient_service.repository.PatientRepository;
import com.healthcare.patient_service.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final MedicalDocumentRepository medicalDocumentRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final FileStorageService fileStorageService;
    
    @Value("${app.base-url}")
    private String baseUrl;
    
    public PatientService(PatientRepository patientRepository, 
                          MedicalDocumentRepository medicalDocumentRepository,
                          MedicalHistoryRepository medicalHistoryRepository,
                          PrescriptionRepository prescriptionRepository,
                          FileStorageService fileStorageService) {
        this.patientRepository = patientRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.fileStorageService = fileStorageService;
    }
    
    // ==================== PATIENT REGISTRATION ====================
    
    @Transactional
    public PatientDTO registerPatient(PatientRegistrationRequest request) {
        System.out.println("Registering new patient with user ID: " + request.getUserId());
        
        if (patientRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new DuplicateResourceException("Patient profile already exists for user ID: " + request.getUserId());
        }
        
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email", request.getEmail());

        }
        
        if (request.getPhoneNumber() != null && 
            patientRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number", request.getPhoneNumber());
        }
        
        Patient patient = Patient.builder()
            .userId(request.getUserId())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .middleName(request.getMiddleName())
            .email(request.getEmail())
            .phoneNumber(request.getPhoneNumber())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender())
            .bloodGroup(request.getBloodGroup())
            .addressLine1(request.getAddressLine1())
            .addressLine2(request.getAddressLine2())
            .city(request.getCity())
            .state(request.getState())
            .postalCode(request.getPostalCode())
            .country(request.getCountry())
            .emergencyContactName(request.getEmergencyContactName())
            .emergencyContactPhone(request.getEmergencyContactPhone())
            .emergencyContactRelation(request.getEmergencyContactRelation())
            .allergies(request.getAllergies())
            .chronicConditions(request.getChronicConditions())
            .currentMedications(request.getCurrentMedications())
            .active(true)
            .build();
        
        Patient savedPatient = patientRepository.save(patient);
        System.out.println("Patient registered successfully with ID: " + savedPatient.getId());
        
        return mapToPatientDTO(savedPatient);
    }
    
    // ==================== PATIENT PROFILE METHODS (Patient Role) ====================
    
    public PatientDTO getPatientProfile(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        return mapToPatientDTO(patient);
    }
    
    public PatientDTO getPatientProfileByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
            .orElseThrow(() -> new PatientNotFoundException("user ID", String.valueOf(userId)));
        return mapToPatientDTO(patient);
    }
    
    @Transactional
    public PatientDTO updateProfile(Long patientId, ProfileUpdateRequest request) {
        System.out.println("Updating profile for patient ID: " + patientId);
        
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null) patient.setLastName(request.getLastName());
        if (request.getMiddleName() != null) patient.setMiddleName(request.getMiddleName());
        if (request.getEmail() != null) patient.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getAddressLine1() != null) patient.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) patient.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) patient.setCity(request.getCity());
        if (request.getState() != null) patient.setState(request.getState());
        if (request.getPostalCode() != null) patient.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) patient.setCountry(request.getCountry());
        if (request.getEmergencyContactName() != null) 
            patient.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) 
            patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getEmergencyContactRelation() != null) 
            patient.setEmergencyContactRelation(request.getEmergencyContactRelation());
        if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());
        if (request.getChronicConditions() != null) 
            patient.setChronicConditions(request.getChronicConditions());
        if (request.getCurrentMedications() != null) 
            patient.setCurrentMedications(request.getCurrentMedications());
        
        Patient updatedPatient = patientRepository.save(patient);
        System.out.println("Profile updated successfully for patient ID: " + patientId);
        
        return mapToPatientDTO(updatedPatient);
    }
    
    // ==================== DOCUMENT METHODS ====================
    
    @Transactional
    public MedicalDocumentDTO uploadDocument(Long patientId, MultipartFile file, 
                                             String documentType, String description, 
                                             String notes, String uploadedBy) {
        System.out.println("Uploading document for patient ID: " + patientId + ", type: " + documentType);
        
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        try {
            String storedFileName = fileStorageService.storeFile(file, patientId);
            String fileUrl = baseUrl + "/api/patients/" + patientId + "/documents/" + storedFileName;
            
            MedicalDocument document = MedicalDocument.builder()
                .patient(patient)
                .fileName(file.getOriginalFilename())
                .filePath(storedFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .documentType(documentType)
                .description(description)
                .notes(notes)
                .uploadedBy(uploadedBy)
                .uploadedAt(LocalDateTime.now())
                .verified(false)
                .build();
            
            MedicalDocument savedDocument = medicalDocumentRepository.save(document);
            System.out.println("Document uploaded successfully with ID: " + savedDocument.getId());
            
            return mapToDocumentDTO(savedDocument, fileUrl);
            
        } catch (IOException e) {
            System.err.println("Failed to upload document: " + e.getMessage());
            throw new DocumentUploadException("Failed to upload document: " + e.getMessage(), e);
        }
    }
    
    public List<MedicalDocumentDTO> getPatientDocuments(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException(patientId);
        }
        
        return medicalDocumentRepository.findByPatientId(patientId).stream()
            .map(doc -> {
                String fileUrl = baseUrl + "/api/patients/" + patientId + "/documents/" + doc.getFilePath();
                return mapToDocumentDTO(doc, fileUrl);
            })
            .collect(Collectors.toList());
    }
    
    public Path getDocumentFilePath(Long patientId, String fileName) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException(patientId);
        }
        return fileStorageService.getFilePath(patientId, fileName);
    }
    
    // ==================== PRESCRIPTION METHODS ====================
    
    public List<PrescriptionDTO> getPatientPrescriptions(Long patientId) {
        System.out.println("Fetching prescriptions for patient ID: " + patientId);
        return List.of();
    }
    
    // ==================== MEDICAL HISTORY METHODS ====================
    
    public MedicalHistoryDTO getMedicalHistory(Long patientId) {
        System.out.println("Fetching medical history for patient ID: " + patientId);
        return MedicalHistoryDTO.builder()
            .patientId(patientId)
            .historyType("MEDICAL_HISTORY")
            .title("No Medical History Records")
            .description("No medical history records found.")
            .status("EMPTY")
            .build();
    }
    
    // ==================== ADMIN METHODS ====================
    
    /**
     * Get all patients (Admin only)
     */
    public List<PatientDTO> getAllPatients() {
        System.out.println("Fetching all patients (Admin)");
        List<Patient> patients = patientRepository.findAll();
        return patients.stream()
            .map(this::mapToPatientDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Search patients by name (first name or last name) - Admin
     */
    public List<PatientDTO> searchPatientsByName(String name) {
        System.out.println("Searching patients by name: " + name);
        
        if (name == null || name.trim().isEmpty()) {
            return getAllPatients();
        }
        
        List<Patient> patients = patientRepository.searchByName(name);
        return patients.stream()
            .map(this::mapToPatientDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Update patient account status (activate/deactivate) - Admin
     */
    @Transactional
    public PatientDTO updatePatientStatus(Long patientId, boolean active) {
        System.out.println("Updating patient status: ID=" + patientId + ", active=" + active);
        
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        patient.setActive(active);
        Patient updatedPatient = patientRepository.save(patient);
        
        System.out.println("Patient status updated: " + (active ? "Activated" : "Deactivated"));
        return mapToPatientDTO(updatedPatient);
    }
    
    /**
     * Get patient statistics for admin dashboard
     */
    public PatientStatsDTO getPatientStats() {
        System.out.println("Fetching patient statistics");
        
        List<Patient> allPatients = patientRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        
        // Count statistics
        long totalPatients = allPatients.size();
        long activePatients = allPatients.stream().filter(Patient::isActive).count();
        long inactivePatients = totalPatients - activePatients;
        
        long registeredThisMonth = allPatients.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfMonth))
            .count();
        
        long registeredToday = allPatients.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfDay))
            .count();
        
        // Gender distribution
        long maleCount = allPatients.stream().filter(p -> "MALE".equalsIgnoreCase(p.getGender())).count();
        long femaleCount = allPatients.stream().filter(p -> "FEMALE".equalsIgnoreCase(p.getGender())).count();
        long otherCount = totalPatients - maleCount - femaleCount;
        
        // Blood group distribution
        Map<String, Long> bloodGroupCounts = allPatients.stream()
            .filter(p -> p.getBloodGroup() != null && !p.getBloodGroup().isEmpty())
            .collect(Collectors.groupingBy(Patient::getBloodGroup, Collectors.counting()));
        
        return PatientStatsDTO.builder()
            .totalPatients(totalPatients)
            .activePatients(activePatients)
            .inactivePatients(inactivePatients)
            .patientsRegisteredThisMonth(registeredThisMonth)
            .patientsRegisteredToday(registeredToday)
            .totalDocuments(getTotalDocuments())
            .totalPrescriptions(getTotalPrescriptions())
            .maleCount(maleCount)
            .femaleCount(femaleCount)
            .otherCount(otherCount)
            .bloodGroupAPositive(bloodGroupCounts.getOrDefault("A+", 0L))
            .bloodGroupANegative(bloodGroupCounts.getOrDefault("A-", 0L))
            .bloodGroupBPositive(bloodGroupCounts.getOrDefault("B+", 0L))
            .bloodGroupBNegative(bloodGroupCounts.getOrDefault("B-", 0L))
            .bloodGroupOPositive(bloodGroupCounts.getOrDefault("O+", 0L))
            .bloodGroupONegative(bloodGroupCounts.getOrDefault("O-", 0L))
            .bloodGroupABPositive(bloodGroupCounts.getOrDefault("AB+", 0L))
            .bloodGroupABNegative(bloodGroupCounts.getOrDefault("AB-", 0L))
            .build();
    }
    
    /**
     * Get total patient count - Admin
     */
    public long getPatientCount() {
        return patientRepository.count();
    }
    
    /**
     * Get total documents count (helper for stats)
     */
    private long getTotalDocuments() {
        return medicalDocumentRepository.count();
    }
    
    /**
     * Get total prescriptions count (helper for stats)
     */
    private long getTotalPrescriptions() {
        return prescriptionRepository.count();
    }
    
    // ==================== MAPPING METHODS ====================
    
    private PatientDTO mapToPatientDTO(Patient patient) {
        return PatientDTO.builder()
            .id(patient.getId())
            .userId(patient.getUserId())
            .firstName(patient.getFirstName())
            .lastName(patient.getLastName())
            .middleName(patient.getMiddleName())
            .fullName(patient.getFullName())
            .email(patient.getEmail())
            .phoneNumber(patient.getPhoneNumber())
            .dateOfBirth(patient.getDateOfBirth())
            .gender(patient.getGender())
            .bloodGroup(patient.getBloodGroup())
            .addressLine1(patient.getAddressLine1())
            .addressLine2(patient.getAddressLine2())
            .city(patient.getCity())
            .state(patient.getState())
            .postalCode(patient.getPostalCode())
            .country(patient.getCountry())
            .emergencyContactName(patient.getEmergencyContactName())
            .emergencyContactPhone(patient.getEmergencyContactPhone())
            .emergencyContactRelation(patient.getEmergencyContactRelation())
            .allergies(patient.getAllergies())
            .chronicConditions(patient.getChronicConditions())
            .currentMedications(patient.getCurrentMedications())
            .active(patient.isActive())
            .profilePictureUrl(patient.getProfilePictureUrl())
            .createdAt(patient.getCreatedAt())
            .updatedAt(patient.getUpdatedAt())
            .build();
    }
    
    private MedicalDocumentDTO mapToDocumentDTO(MedicalDocument document, String fileUrl) {
        return MedicalDocumentDTO.builder()
            .id(document.getId())
            .patientId(document.getPatient().getId())
            .fileName(document.getFileName())
            .fileUrl(fileUrl)
            .fileType(document.getFileType())
            .fileSize(document.getFileSize())
            .documentType(document.getDocumentType())
            .description(document.getDescription())
            .notes(document.getNotes())
            .uploadedBy(document.getUploadedBy())
            .uploadedAt(document.getUploadedAt())
            .documentDate(document.getDocumentDate())
            .verified(document.isVerified())
            .build();
    }


// ==================== DELETE METHODS ====================

/**
 * Delete a specific document
 * 
 * @param patientId - Patient ID
 * @param documentId - Document ID to delete
 */
@Transactional
public void deleteDocument(Long patientId, Long documentId) {
    System.out.println("Deleting document ID: " + documentId + " for patient ID: " + patientId);
    
    // Verify patient exists
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    // Find document and verify it belongs to the patient
    MedicalDocument document = medicalDocumentRepository.findById(documentId)
        .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));
    
    if (!document.getPatient().getId().equals(patientId)) {
        throw new RuntimeException("Document does not belong to this patient");
    }
    
    // Delete physical file from disk
    try {
        Path filePath = fileStorageService.getFilePath(patientId, document.getFilePath());
        java.nio.file.Files.deleteIfExists(filePath);
        System.out.println("Physical file deleted: " + filePath);
    } catch (IOException e) {
        System.err.println("Failed to delete physical file: " + e.getMessage());
        // Continue to delete database record even if file deletion fails
    }
    
    // Delete database record
    medicalDocumentRepository.delete(document);
    System.out.println("Document record deleted successfully");
}

/**
 * Delete all documents for a patient (Admin only)
 * 
 * @param patientId - Patient ID
 */
@Transactional
public void deleteAllDocuments(Long patientId) {
    System.out.println("Deleting all documents for patient ID: " + patientId);
    
    // Verify patient exists
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    // Get all documents
    List<MedicalDocument> documents = medicalDocumentRepository.findByPatientId(patientId);
    
    // Delete physical files
    for (MedicalDocument doc : documents) {
        try {
            Path filePath = fileStorageService.getFilePath(patientId, doc.getFilePath());
            java.nio.file.Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + doc.getFilePath());
        }
    }
    
    // Delete all database records
    medicalDocumentRepository.deleteByPatientId(patientId);
    System.out.println("All documents deleted for patient ID: " + patientId);
}

/**
 * Delete patient account (Soft delete - just deactivate)
 * 
 * @param patientId - Patient ID
 */
@Transactional
public void deletePatientAccount(Long patientId) {
    System.out.println("Soft deleting patient account ID: " + patientId);
    
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    // Soft delete - just deactivate account
    patient.setActive(false);
    patientRepository.save(patient);
    System.out.println("Patient account deactivated");
}

/**
 * Permanently delete patient (Hard delete - Admin only)
 * 
 * @param patientId - Patient ID
 */
@Transactional
public void permanentlyDeletePatient(Long patientId) {
    System.out.println("Permanently deleting patient ID: " + patientId);
    
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    // First delete all physical files
    deleteAllDocuments(patientId);
    
    // Delete related records (medical history, prescriptions) will cascade
    // due to CascadeType.ALL in Patient entity
    
    // Finally delete the patient
    patientRepository.delete(patient);
    System.out.println("Patient permanently deleted");
}
}