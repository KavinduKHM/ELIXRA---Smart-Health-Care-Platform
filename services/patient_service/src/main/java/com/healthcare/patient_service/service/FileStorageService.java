package com.healthcare.patient_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * File Storage Service - Handles storing and retrieving uploaded files
 */
@Service
public class FileStorageService {
    
    @Value("${app.file.upload-dir:./uploads/patients}")
    private String uploadDir;
    
    /**
     * Store uploaded file on disk
     */
    public String storeFile(MultipartFile file, Long patientId) throws IOException {
        // Create directory if not exists
        Path patientDir = Paths.get(uploadDir, patientId.toString());
        if (!Files.exists(patientDir)) {
            Files.createDirectories(patientDir);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path targetPath = patientDir.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        return storedFileName;
    }
    
    /**
     * Get file path for a stored file
     */
    public Path getFilePath(Long patientId, String fileName) {
        return Paths.get(uploadDir, patientId.toString(), fileName);
    }
}