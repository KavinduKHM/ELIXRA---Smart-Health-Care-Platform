package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MedicalHistoryDTO {
    
    private Long id;
    private Long patientId;
    private String historyType;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String doctorName;
    private String facilityName;
    private String status;
    private LocalDateTime createdAt;
    
    public MedicalHistoryDTO() {}
    
    public static MedicalHistoryDTOBuilder builder() {
        return new MedicalHistoryDTOBuilder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public String getHistoryType() { return historyType; }
    public void setHistoryType(String historyType) { this.historyType = historyType; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    // Builder
    public static class MedicalHistoryDTOBuilder {
        private MedicalHistoryDTO dto = new MedicalHistoryDTO();
        
        public MedicalHistoryDTOBuilder id(Long id) { dto.id = id; return this; }
        public MedicalHistoryDTOBuilder patientId(Long patientId) { dto.patientId = patientId; return this; }
        public MedicalHistoryDTOBuilder historyType(String historyType) { dto.historyType = historyType; return this; }
        public MedicalHistoryDTOBuilder title(String title) { dto.title = title; return this; }
        public MedicalHistoryDTOBuilder description(String description) { dto.description = description; return this; }
        public MedicalHistoryDTOBuilder eventDate(LocalDateTime eventDate) { dto.eventDate = eventDate; return this; }
        public MedicalHistoryDTOBuilder doctorName(String doctorName) { dto.doctorName = doctorName; return this; }
        public MedicalHistoryDTOBuilder facilityName(String facilityName) { dto.facilityName = facilityName; return this; }
        public MedicalHistoryDTOBuilder status(String status) { dto.status = status; return this; }
        public MedicalHistoryDTOBuilder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }
        
        public MedicalHistoryDTO build() { return dto; }
    }
}