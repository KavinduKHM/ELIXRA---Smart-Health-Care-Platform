package com.healthcare.patient_service.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_histories")
@EntityListeners(AuditingEntityListener.class)
public class MedicalHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private String historyType;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private LocalDateTime eventDate;
    private String doctorName;
    private String facilityName;
    private String status;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    public MedicalHistory() {}
    
    // ==================== GETTERS ====================
    public Long getId() { return id; }
    public Patient getPatient() { return patient; }
    public String getHistoryType() { return historyType; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getEventDate() { return eventDate; }
    public String getDoctorName() { return doctorName; }
    public String getFacilityName() { return facilityName; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    // ==================== SETTERS ====================
    public void setId(Long id) { this.id = id; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public void setHistoryType(String historyType) { this.historyType = historyType; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // ==================== BUILDER PATTERN ====================
    public static MedicalHistoryBuilder builder() {
        return new MedicalHistoryBuilder();
    }
    
    public static class MedicalHistoryBuilder {
        private MedicalHistory history = new MedicalHistory();
        
        public MedicalHistoryBuilder id(Long id) { history.id = id; return this; }
        public MedicalHistoryBuilder patient(Patient patient) { history.patient = patient; return this; }
        public MedicalHistoryBuilder historyType(String historyType) { history.historyType = historyType; return this; }
        public MedicalHistoryBuilder title(String title) { history.title = title; return this; }
        public MedicalHistoryBuilder description(String description) { history.description = description; return this; }
        public MedicalHistoryBuilder eventDate(LocalDateTime eventDate) { history.eventDate = eventDate; return this; }
        public MedicalHistoryBuilder doctorName(String doctorName) { history.doctorName = doctorName; return this; }
        public MedicalHistoryBuilder facilityName(String facilityName) { history.facilityName = facilityName; return this; }
        public MedicalHistoryBuilder status(String status) { history.status = status; return this; }
        public MedicalHistoryBuilder createdAt(LocalDateTime createdAt) { history.createdAt = createdAt; return this; }
        
        public MedicalHistory build() { return history; }
    }
    
    // ==================== HISTORY TYPE CONSTANTS ====================
    public static class HistoryType {
        public static final String DIAGNOSIS = "DIAGNOSIS";
        public static final String SURGERY = "SURGERY";
        public static final String VACCINATION = "VACCINATION";
        public static final String HOSPITALIZATION = "HOSPITALIZATION";
        public static final String ALLERGY = "ALLERGY";
        public static final String FAMILY_HISTORY = "FAMILY_HISTORY";
    }
}