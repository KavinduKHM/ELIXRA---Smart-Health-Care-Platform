package com.healthcare.patient_service.service;

import com.healthcare.patient_service.model.MedicalDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class FileStorageService {
    
    private final CloudinaryService cloudinaryService;
    
    public FileStorageService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    
    /**
     * Store uploaded file in Cloudinary
     */
    public MedicalDocument storeFile(MultipartFile file, Long patientId, String documentType,
                                      String description, String notes, String uploadedBy) throws IOException {
        
        System.out.println("Uploading file to Cloudinary for patient: " + patientId + ", type: " + documentType);
        
        // Upload to Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadFile(file, patientId, documentType);
        
        // Create document record
        MedicalDocument document = MedicalDocument.builder()
            .fileName(file.getOriginalFilename())
            .filePath(uploadResult.get("publicId"))
            .fileUrl(uploadResult.get("url"))
            .fileType(uploadResult.get("format"))
            .fileSize(Long.parseLong(uploadResult.get("bytes")))
            .documentType(documentType)
            .description(description)
            .notes(notes)
            .uploadedBy(uploadedBy)
            .uploadedAt(LocalDateTime.now())
            .verified(false)
            .build();
        
        System.out.println("File stored in Cloudinary: " + uploadResult.get("url"));
        
        return document;
    }
    
    /**
     * Delete file from Cloudinary
     */
    public void deleteFile(MedicalDocument document) throws IOException {
        if (document.getFilePath() != null) {
            cloudinaryService.deleteFile(document.getFilePath());
            System.out.println("Deleted from Cloudinary: " + document.getFilePath());
        }
    }
}