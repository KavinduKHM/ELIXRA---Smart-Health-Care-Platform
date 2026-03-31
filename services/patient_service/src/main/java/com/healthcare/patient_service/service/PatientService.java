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
    private final CloudinaryService cloudinaryService;
    
    @Value("${app.base-url}")
    private String baseUrl;
    
    public PatientService(PatientRepository patientRepository, 
                          MedicalDocumentRepository medicalDocumentRepository,
                          MedicalHistoryRepository medicalHistoryRepository,
                          PrescriptionRepository prescriptionRepository,
                          FileStorageService fileStorageService,
                          CloudinaryService cloudinaryService) {
        this.patientRepository = patientRepository;
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.fileStorageService = fileStorageService;
        this.cloudinaryService = cloudinaryService;
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
    
    // ==================== PATIENT PROFILE METHODS ====================
    
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
    
    // ==================== PROFILE PICTURE METHODS ====================
    
    @Transactional
    public PatientDTO uploadProfilePicture(Long patientId, MultipartFile file) {
        System.out.println("Uploading profile picture for patient ID: " + patientId);
        
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        try {
            // Upload to Cloudinary
            Map<String, String> uploadResult = cloudinaryService.uploadProfilePicture(file, patientId);
            
            // Update patient with new profile picture URL
            patient.setProfilePictureUrl(uploadResult.get("url"));
            Patient updatedPatient = patientRepository.save(patient);
            
            System.out.println("Profile picture uploaded successfully: " + uploadResult.get("url"));
            return mapToPatientDTO(updatedPatient);
            
        } catch (IOException e) {
            System.err.println("Failed to upload profile picture: " + e.getMessage());
            throw new DocumentUploadException("Failed to upload profile picture: " + e.getMessage(), e);
        }
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
            // Store file in Cloudinary
            MedicalDocument document = fileStorageService.storeFile(
                file, patientId, documentType, description, notes, uploadedBy);
            
            // Set patient reference
            document.setPatient(patient);
            
            // Save to database
            MedicalDocument savedDocument = medicalDocumentRepository.save(document);
            System.out.println("Document uploaded successfully with ID: " + savedDocument.getId());
            
            return mapToDocumentDTO(savedDocument, savedDocument.getFileUrl());
            
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
            .map(doc -> mapToDocumentDTO(doc, doc.getFileUrl()))
            .collect(Collectors.toList());
    }
    
    // ==================== PRESCRIPTION METHODS ====================
    
    public List<PrescriptionDTO> getPatientPrescriptions(Long patientId) {
        System.out.println("Fetching prescriptions for patient ID: " + patientId);
        return List.of();
    }
    
   // ==================== MEDICAL HISTORY METHODS ====================

/**
 * Get medical history for a patient
 * Returns the most recent medical history record
 */
public MedicalHistoryDTO getMedicalHistory(Long patientId) {
    System.out.println("Fetching medical history for patient ID: " + patientId);
    
    // Verify patient exists
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    // Get all medical history records for the patient
    List<MedicalHistory> historyList = medicalHistoryRepository.findByPatientIdOrderByEventDateDesc(patientId);
    
    if (historyList.isEmpty()) {
        // Return empty medical history if none exists
        return MedicalHistoryDTO.builder()
            .patientId(patientId)
            .historyType("MEDICAL_HISTORY")
            .title("No Medical History Records")
            .description("No medical history records found for this patient.")
            .status("EMPTY")
            .build();
    }
    
    // Return the most recent record
    MedicalHistory mostRecent = historyList.get(0);
    
    return MedicalHistoryDTO.builder()
        .id(mostRecent.getId())
        .patientId(mostRecent.getPatient().getId())
        .historyType(mostRecent.getHistoryType())
        .title(mostRecent.getTitle())
        .description(mostRecent.getDescription())
        .eventDate(mostRecent.getEventDate())
        .doctorName(mostRecent.getDoctorName())
        .facilityName(mostRecent.getFacilityName())
        .status(mostRecent.getStatus())
        .createdAt(mostRecent.getCreatedAt())
        .build();
}

/**
 * Get all medical history records for a patient
 */
public List<MedicalHistoryDTO> getAllMedicalHistoryRecords(Long patientId) {
    System.out.println("Fetching all medical history records for patient ID: " + patientId);
    
    // Verify patient exists
    if (!patientRepository.existsById(patientId)) {
        throw new PatientNotFoundException(patientId);
    }
    
    List<MedicalHistory> historyList = medicalHistoryRepository.findByPatientIdOrderByEventDateDesc(patientId);
    
    return historyList.stream()
        .map(this::mapToMedicalHistoryDTO)
        .collect(Collectors.toList());
}

/**
 * Get medical history by type
 */
public List<MedicalHistoryDTO> getMedicalHistoryByType(Long patientId, String historyType) {
    System.out.println("Fetching medical history for patient ID: " + patientId + ", type: " + historyType);
    
    // Verify patient exists
    if (!patientRepository.existsById(patientId)) {
        throw new PatientNotFoundException(patientId);
    }
    
    List<MedicalHistory> historyList = medicalHistoryRepository.findByPatientIdAndHistoryType(patientId, historyType);
    
    return historyList.stream()
        .map(this::mapToMedicalHistoryDTO)
        .collect(Collectors.toList());
}

/**
 * Add medical history record
 */
@Transactional
public MedicalHistoryDTO addMedicalHistory(Long patientId, MedicalHistoryRequest request) {
    System.out.println("Adding medical history for patient ID: " + patientId);
    
    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new PatientNotFoundException(patientId));
    
    MedicalHistory history = MedicalHistory.builder()
        .patient(patient)
        .historyType(request.getHistoryType())
        .title(request.getTitle())
        .description(request.getDescription())
        .eventDate(request.getEventDate())
        .doctorName(request.getDoctorName())
        .facilityName(request.getFacilityName())
        .status(request.getStatus())
        .build();
    
    MedicalHistory savedHistory = medicalHistoryRepository.save(history);
    System.out.println("Medical history added with ID: " + savedHistory.getId());
    
    return mapToMedicalHistoryDTO(savedHistory);
}

/**
 * Update medical history record
 */
@Transactional
public MedicalHistoryDTO updateMedicalHistory(Long historyId, MedicalHistoryRequest request) {
    System.out.println("Updating medical history ID: " + historyId);
    
    MedicalHistory history = medicalHistoryRepository.findById(historyId)
        .orElseThrow(() -> new RuntimeException("Medical history not found with ID: " + historyId));
    
    if (request.getHistoryType() != null) history.setHistoryType(request.getHistoryType());
    if (request.getTitle() != null) history.setTitle(request.getTitle());
    if (request.getDescription() != null) history.setDescription(request.getDescription());
    if (request.getEventDate() != null) history.setEventDate(request.getEventDate());
    if (request.getDoctorName() != null) history.setDoctorName(request.getDoctorName());
    if (request.getFacilityName() != null) history.setFacilityName(request.getFacilityName());
    if (request.getStatus() != null) history.setStatus(request.getStatus());
    
    MedicalHistory updatedHistory = medicalHistoryRepository.save(history);
    
    return mapToMedicalHistoryDTO(updatedHistory);
}

/**
 * Delete medical history record
 */
@Transactional
public void deleteMedicalHistory(Long historyId) {
    System.out.println("Deleting medical history ID: " + historyId);
    
    MedicalHistory history = medicalHistoryRepository.findById(historyId)
        .orElseThrow(() -> new RuntimeException("Medical history not found with ID: " + historyId));
    
    medicalHistoryRepository.delete(history);
    System.out.println("Medical history deleted");
}

/**
 * Map MedicalHistory entity to DTO
 */
private MedicalHistoryDTO mapToMedicalHistoryDTO(MedicalHistory history) {
    return MedicalHistoryDTO.builder()
        .id(history.getId())
        .patientId(history.getPatient().getId())
        .historyType(history.getHistoryType())
        .title(history.getTitle())
        .description(history.getDescription())
        .eventDate(history.getEventDate())
        .doctorName(history.getDoctorName())
        .facilityName(history.getFacilityName())
        .status(history.getStatus())
        .createdAt(history.getCreatedAt())
        .build();
}
    
    // ==================== ADMIN METHODS ====================
    
    public List<PatientDTO> getAllPatients() {
        System.out.println("Fetching all patients (Admin)");
        List<Patient> patients = patientRepository.findAll();
        return patients.stream()
            .map(this::mapToPatientDTO)
            .collect(Collectors.toList());
    }
    
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
    
    public PatientStatsDTO getPatientStats() {
        System.out.println("Fetching patient statistics");
        
        List<Patient> allPatients = patientRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        
        long totalPatients = allPatients.size();
        long activePatients = allPatients.stream().filter(Patient::isActive).count();
        long inactivePatients = totalPatients - activePatients;
        
        long registeredThisMonth = allPatients.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfMonth))
            .count();
        
        long registeredToday = allPatients.stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfDay))
            .count();
        
        long maleCount = allPatients.stream().filter(p -> "MALE".equalsIgnoreCase(p.getGender())).count();
        long femaleCount = allPatients.stream().filter(p -> "FEMALE".equalsIgnoreCase(p.getGender())).count();
        long otherCount = totalPatients - maleCount - femaleCount;
        
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
    
    public long getPatientCount() {
        return patientRepository.count();
    }
    
    private long getTotalDocuments() {
        return medicalDocumentRepository.count();
    }
    
    private long getTotalPrescriptions() {
        return prescriptionRepository.count();
    }
    
    // ==================== DELETE METHODS ====================
    
    @Transactional
    public void deleteDocument(Long patientId, Long documentId) {
        System.out.println("Deleting document ID: " + documentId + " for patient ID: " + patientId);
        
        // Verify patient exists
        patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        // Find document
        MedicalDocument document = medicalDocumentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found with ID: " + documentId));
        
        if (!document.getPatient().getId().equals(patientId)) {
            throw new RuntimeException("Document does not belong to this patient");
        }
        
        try {
            // Delete from Cloudinary
            fileStorageService.deleteFile(document);
            
            // Delete database record
            medicalDocumentRepository.delete(document);
            System.out.println("Document deleted successfully");
            
        } catch (IOException e) {
            System.err.println("Failed to delete document: " + e.getMessage());
            throw new RuntimeException("Failed to delete document", e);
        }
    }
    
    @Transactional
    public void deleteAllDocuments(Long patientId) {
        System.out.println("Deleting all documents for patient ID: " + patientId);
        
        // Verify patient exists
        patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        // Get all documents
        List<MedicalDocument> documents = medicalDocumentRepository.findByPatientId(patientId);
        
        // Delete from Cloudinary
        for (MedicalDocument doc : documents) {
            try {
                fileStorageService.deleteFile(doc);
            } catch (IOException e) {
                System.err.println("Failed to delete file: " + doc.getFilePath());
            }
        }
        
        // Delete all database records
        medicalDocumentRepository.deleteByPatientId(patientId);
        System.out.println("All documents deleted for patient ID: " + patientId);
    }
    
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
    
    @Transactional
    public void permanentlyDeletePatient(Long patientId) {
        System.out.println("PERMANENTLY deleting patient ID: " + patientId);
        
        // Find patient
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new PatientNotFoundException(patientId));
        
        // Delete all documents from Cloudinary first
        List<MedicalDocument> documents = medicalDocumentRepository.findByPatientId(patientId);
        for (MedicalDocument doc : documents) {
            try {
                fileStorageService.deleteFile(doc);
            } catch (IOException e) {
                System.err.println("Failed to delete file: " + doc.getFilePath());
            }
        }
        
        // Delete profile picture from Cloudinary if exists
        if (patient.getProfilePictureUrl() != null) {
            try {
                String publicId = extractPublicIdFromUrl(patient.getProfilePictureUrl());
                if (publicId != null) {
                    cloudinaryService.deleteFile(publicId);
                }
            } catch (IOException e) {
                System.err.println("Failed to delete profile picture: " + e.getMessage());
            }
        }
        
        // Delete medical history records
        medicalHistoryRepository.deleteByPatientId(patientId);
        
        // Delete prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatientId(patientId);
        prescriptionRepository.deleteAll(prescriptions);
        
        // Delete all document records
        medicalDocumentRepository.deleteByPatientId(patientId);
        
        // Finally delete the patient
        patientRepository.delete(patient);
        
        System.out.println("Patient permanently deleted from database");
    }
    
    private String extractPublicIdFromUrl(String url) {
        if (url == null) return null;
        try {
            String[] parts = url.split("/upload/");
            if (parts.length > 1) {
                String afterUpload = parts[1];
                if (afterUpload.contains("/")) {
                    String[] subParts = afterUpload.split("/", 2);
                    return subParts.length > 1 ? subParts[1] : afterUpload;
                }
                return afterUpload;
            }
        } catch (Exception e) {
            System.err.println("Failed to extract public ID: " + e.getMessage());
        }
        return null;
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
}