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
    
    @Transactional
    public PatientDTO registerPatient(PatientRegistrationRequest request) {
        System.out.println("Registering new patient with user ID: " + request.getUserId());
        
        if (patientRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new DuplicateResourceException("Patient profile already exists for user ID: " + request.getUserId());
        }
        
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email", request.getEmail(), baseUrl);
        }
        
        if (request.getPhoneNumber() != null && 
            patientRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number", request.getPhoneNumber(), baseUrl);
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
    
    public List<PrescriptionDTO> getPatientPrescriptions(Long patientId) {
        System.out.println("Fetching prescriptions for patient ID: " + patientId);
        return List.of();
    }
    
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