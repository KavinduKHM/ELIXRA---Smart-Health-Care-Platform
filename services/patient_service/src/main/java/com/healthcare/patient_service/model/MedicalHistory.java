package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MedicalHistory Entity - Stores patient's medical history.
 * 
 * Includes:
 * - Allergies
 * - Chronic conditions (diabetes, hypertension, etc.)
 * - Past surgeries
 * - Medications history
 * - Vaccinations
 */
@Entity
@Table(name = "medical_histories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MedicalHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Type of medical history entry
    private String entryType;  // "ALLERGY", "CONDITION", "SURGERY", "MEDICATION", "VACCINATION"
    
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private LocalDate diagnosedDate;
    
    // Severity level
    private String severity;  // "MILD", "MODERATE", "SEVERE"
    
    // Current status
    private String status;  // "ACTIVE", "RESOLVED", "CHRONIC", "REMITTED"
    
    @Column(length = 1000)
    private String notes;
    
    // Who recorded this history (doctor ID)
    private Long recordedBy;
    
    // Relationship to patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}