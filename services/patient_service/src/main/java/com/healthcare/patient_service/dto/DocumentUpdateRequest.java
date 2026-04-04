package com.healthcare.patient_service.dto;

import org.springframework.web.multipart.MultipartFile;

public class DocumentUpdateRequest {
    
    private MultipartFile file;
    private String documentType;
    private String description;
    private String notes;
    
    // Getters and Setters
    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }
    
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}