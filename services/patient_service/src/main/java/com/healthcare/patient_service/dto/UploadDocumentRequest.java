package com.healthcare.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload Document Request DTO
 * Used when patient uploads a medical document
 */
@Data
public class UploadDocumentRequest {
    
    @NotBlank(message = "Document type is required")
    private String documentType;  // LAB_REPORT, PRESCRIPTION, etc.
    
    private String description;
    private String notes;
    private String documentDate;  // Optional: date of the document
}