package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * MedicalDocument Entity - Stores uploaded medical reports and documents.
 * 
 * represents files uploaded by patients such as:
 * - Medical reports
 * - Lab results
 * - Prescriptions (scanned)
 * - Insurance documents
 */
@Entity
@Table(name = "medical_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MedicalDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String fileType;  // PDF, JPG, PNG, etc.
    
    @Column(nullable = false)
    private String filePath;  // Path where file is stored on disk
    
    private Long fileSize;  // Size in bytes
    
    // Document type categories
    private String documentType;  // "REPORT", "PRESCRIPTION", "LAB_RESULT", "INSURANCE", "OTHER"
    
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime uploadDate;
    
    // Who uploaded this document (patient ID or doctor ID)
    private Long uploadedBy;
    
    // Relationship to patient (many documents belong to one patient)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    /**
     * Automatically set upload date before persisting
     */
    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }
}