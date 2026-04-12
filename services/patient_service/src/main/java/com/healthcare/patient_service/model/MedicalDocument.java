package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_documents")
@EntityListeners(AuditingEntityListener.class)
public class MedicalDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "file_path", nullable = false, unique = true)
    private String filePath;  // Stores Cloudinary public ID or local file path
    
    @Column(name = "file_url")
    private String fileUrl;   // Cloudinary secure URL (NEW)
    
    @Column(name = "file_type")
    private String fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "document_type", nullable = false)
    private String documentType;
    
    private String description;
    private String notes;
    
    @Column(name = "uploaded_by")
    private String uploadedBy;
    
    @CreatedDate
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "document_date")
    private LocalDateTime documentDate;
    
    private boolean verified = false;
    
    public MedicalDocument() {}
    
    public static MedicalDocumentBuilder builder() {
        return new MedicalDocumentBuilder();
    }
    
    // ==================== GETTERS ====================
    public Long getId() { return id; }
    public Patient getPatient() { return patient; }
    public String getFileName() { return fileName; }
    public String getFilePath() { return filePath; }
    public String getFileUrl() { return fileUrl; }      
    public String getFileType() { return fileType; }
    public Long getFileSize() { return fileSize; }
    public String getDocumentType() { return documentType; }
    public String getDescription() { return description; }
    public String getNotes() { return notes; }
    public String getUploadedBy() { return uploadedBy; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public LocalDateTime getDocumentDate() { return documentDate; }
    public boolean isVerified() { return verified; }
    
    // ==================== SETTERS ====================
    public void setId(Long id) { this.id = id; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }     
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public void setDescription(String description) { this.description = description; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setDocumentDate(LocalDateTime documentDate) { this.documentDate = documentDate; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    // ==================== BUILDER PATTERN ====================
    public static class MedicalDocumentBuilder {
        private MedicalDocument document = new MedicalDocument();
        
        public MedicalDocumentBuilder id(Long id) { document.id = id; return this; }
        public MedicalDocumentBuilder patient(Patient patient) { document.patient = patient; return this; }
        public MedicalDocumentBuilder fileName(String fileName) { document.fileName = fileName; return this; }
        public MedicalDocumentBuilder filePath(String filePath) { document.filePath = filePath; return this; }
        public MedicalDocumentBuilder fileUrl(String fileUrl) { document.fileUrl = fileUrl; return this; }      
        public MedicalDocumentBuilder fileType(String fileType) { document.fileType = fileType; return this; }
        public MedicalDocumentBuilder fileSize(Long fileSize) { document.fileSize = fileSize; return this; }
        public MedicalDocumentBuilder documentType(String documentType) { document.documentType = documentType; return this; }
        public MedicalDocumentBuilder description(String description) { document.description = description; return this; }
        public MedicalDocumentBuilder notes(String notes) { document.notes = notes; return this; }
        public MedicalDocumentBuilder uploadedBy(String uploadedBy) { document.uploadedBy = uploadedBy; return this; }
        public MedicalDocumentBuilder uploadedAt(LocalDateTime uploadedAt) { document.uploadedAt = uploadedAt; return this; }
        public MedicalDocumentBuilder documentDate(LocalDateTime documentDate) { document.documentDate = documentDate; return this; }
        public MedicalDocumentBuilder verified(boolean verified) { document.verified = verified; return this; }
        
        public MedicalDocument build() { return document; }
    }
    
    // ==================== DOCUMENT TYPE CONSTANTS ====================
    public static class DocumentType {
        public static final String LAB_REPORT = "LAB_REPORT";
        public static final String PRESCRIPTION = "PRESCRIPTION";
        public static final String MEDICAL_CERTIFICATE = "MEDICAL_CERTIFICATE";
        public static final String DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY";
        public static final String INSURANCE_DOCUMENT = "INSURANCE_DOCUMENT";
        public static final String OTHER = "OTHER";
    }
}