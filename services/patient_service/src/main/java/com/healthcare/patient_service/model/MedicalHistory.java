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
 * Medical History Entity - Records medical events and conditions
 * 
 * This entity tracks patient's medical history including:
 * - Diagnoses
 * - Surgeries
 * - Vaccinations
 * - Hospitalizations
 * - Allergic reactions
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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private String historyType;  // DIAGNOSIS, SURGERY, VACCINATION, HOSPITALIZATION, ALLERGY
    
    @Column(nullable = false)
    private String title;  // e.g., "Hypertension", "Appendectomy"
    
    @Column(length = 1000)
    private String description;
    
    private LocalDateTime eventDate;  // When the event occurred
    private String doctorName;  // Attending doctor
    private String facilityName;  // Hospital/Clinic name
    
    private String status;  // ACTIVE, RESOLVED, ONGOING
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    /**
     * History type constants
     */
    public static class HistoryType {
        public static final String DIAGNOSIS = "DIAGNOSIS";
        public static final String SURGERY = "SURGERY";
        public static final String VACCINATION = "VACCINATION";
        public static final String HOSPITALIZATION = "HOSPITALIZATION";
        public static final String ALLERGY = "ALLERGY";
        public static final String FAMILY_HISTORY = "FAMILY_HISTORY";
    }
}