package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Prescription Entity - Stores digital prescriptions issued by doctors
 * 
 * This entity maintains all prescriptions issued to the patient.
 * It includes medications, dosage instructions, and validity period.
 */
@Entity
@Table(name = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Prescription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private Long doctorId;  // ID of prescribing doctor
    
    private String doctorName;  // Doctor's full name (denormalized for quick display)
    private String doctorSpecialty;  // Doctor's specialty
    
    @Column(nullable = false)
    private Long appointmentId;  // Associated appointment
    
    @Column(nullable = false)
    private LocalDateTime prescriptionDate;
    
    private LocalDateTime validUntil;  // Prescription validity period
    
    @Column(length = 500)
    private String diagnosis;  // Diagnosis made by doctor
    
    @Column(length = 1000)
    private String notes;  // Additional notes from doctor
    
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionMedication> medications = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private boolean isActive = true;
    private boolean isFulfilled = false;  // Whether medications were dispensed

    // Lombok may generate isActive()/isFulfilled() for boolean fields; however parts of the codebase
    // call getIsActive()/getIsFulfilled(), so we provide explicit getters for compatibility.
    public boolean getIsActive() {
        return isActive;
    }

    public boolean getIsFulfilled() {
        return isFulfilled;
    }
}