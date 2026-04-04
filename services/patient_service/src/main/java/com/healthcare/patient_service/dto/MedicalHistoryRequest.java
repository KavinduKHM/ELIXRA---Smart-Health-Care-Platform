package com.healthcare.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class MedicalHistoryRequest {
    
    @NotBlank(message = "History type is required")
    private String historyType;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Event date is required")
    private LocalDateTime eventDate;
    
    private String doctorName;
    private String facilityName;
    private String status;
    
    // ==================== GETTERS ====================
    public String getHistoryType() { return historyType; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getEventDate() { return eventDate; }
    public String getDoctorName() { return doctorName; }
    public String getFacilityName() { return facilityName; }
    public String getStatus() { return status; }
    
    // ==================== SETTERS ====================
    public void setHistoryType(String historyType) { this.historyType = historyType; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public void setStatus(String status) { this.status = status; }
}