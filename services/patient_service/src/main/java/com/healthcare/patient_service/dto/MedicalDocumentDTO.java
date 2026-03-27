package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicalDocumentDTO {
    
    private Long id;
    private Long patientId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String documentType;
    private String description;
    private String notes;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private LocalDateTime documentDate;
    private boolean verified;
    
    public MedicalDocumentDTO() {}
    
    public static MedicalDocumentDTOBuilder builder() {
        return new MedicalDocumentDTOBuilder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public LocalDateTime getDocumentDate() { return documentDate; }
    public void setDocumentDate(LocalDateTime documentDate) { this.documentDate = documentDate; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    // Builder
    public static class MedicalDocumentDTOBuilder {
        private MedicalDocumentDTO dto = new MedicalDocumentDTO();
        
        public MedicalDocumentDTOBuilder id(Long id) { dto.id = id; return this; }
        public MedicalDocumentDTOBuilder patientId(Long patientId) { dto.patientId = patientId; return this; }
        public MedicalDocumentDTOBuilder fileName(String fileName) { dto.fileName = fileName; return this; }
        public MedicalDocumentDTOBuilder fileUrl(String fileUrl) { dto.fileUrl = fileUrl; return this; }
        public MedicalDocumentDTOBuilder fileType(String fileType) { dto.fileType = fileType; return this; }
        public MedicalDocumentDTOBuilder fileSize(Long fileSize) { dto.fileSize = fileSize; return this; }
        public MedicalDocumentDTOBuilder documentType(String documentType) { dto.documentType = documentType; return this; }
        public MedicalDocumentDTOBuilder description(String description) { dto.description = description; return this; }
        public MedicalDocumentDTOBuilder notes(String notes) { dto.notes = notes; return this; }
        public MedicalDocumentDTOBuilder uploadedBy(String uploadedBy) { dto.uploadedBy = uploadedBy; return this; }
        public MedicalDocumentDTOBuilder uploadedAt(LocalDateTime uploadedAt) { dto.uploadedAt = uploadedAt; return this; }
        public MedicalDocumentDTOBuilder documentDate(LocalDateTime documentDate) { dto.documentDate = documentDate; return this; }
        public MedicalDocumentDTOBuilder verified(boolean verified) { dto.verified = verified; return this; }
        
        public MedicalDocumentDTO build() { return dto; }
    }
}