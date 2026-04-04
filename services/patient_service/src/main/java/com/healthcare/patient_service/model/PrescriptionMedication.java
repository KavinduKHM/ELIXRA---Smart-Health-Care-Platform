package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Prescription Medication Entity - Individual medication within a prescription
 * 
 * This entity stores details for each medication prescribed.
 */
@Entity
@Table(name = "prescription_medications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;
    
    @Column(nullable = false)
    private String medicationName;
    
    private String dosage;  // e.g., "500mg"
    private String frequency;  // e.g., "Twice daily"
    private String duration;  // e.g., "7 days"
    private String timing;  // e.g., "After meals"
    private String instructions;  // Special instructions
    
    private Integer quantity;
    private String refillInfo;
}