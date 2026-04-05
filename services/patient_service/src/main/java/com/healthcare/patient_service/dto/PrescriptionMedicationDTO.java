package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PrescriptionMedicationDTO {
    
    private Long id;

    // doctor-service sends `medicineName`
    @JsonAlias({"medicineName", "name"})
    private String medicationName;

    private String dosage;
    private String frequency;
    private String duration;

    // some payloads may send `timing`
    @JsonAlias({"timing"})
    private String timing;

    private String instructions;
    private Integer quantity;
    private String refillInfo;
    
    public PrescriptionMedicationDTO() {}
    
    public static PrescriptionMedicationDTOBuilder builder() {
        return new PrescriptionMedicationDTOBuilder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }
    
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    
    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getRefillInfo() { return refillInfo; }
    public void setRefillInfo(String refillInfo) { this.refillInfo = refillInfo; }
    
    // Builder
    public static class PrescriptionMedicationDTOBuilder {
        private PrescriptionMedicationDTO dto = new PrescriptionMedicationDTO();
        
        public PrescriptionMedicationDTOBuilder id(Long id) { dto.id = id; return this; }
        public PrescriptionMedicationDTOBuilder medicationName(String name) { dto.medicationName = name; return this; }
        public PrescriptionMedicationDTOBuilder dosage(String dosage) { dto.dosage = dosage; return this; }
        public PrescriptionMedicationDTOBuilder frequency(String frequency) { dto.frequency = frequency; return this; }
        public PrescriptionMedicationDTOBuilder duration(String duration) { dto.duration = duration; return this; }
        public PrescriptionMedicationDTOBuilder timing(String timing) { dto.timing = timing; return this; }
        public PrescriptionMedicationDTOBuilder instructions(String instructions) { dto.instructions = instructions; return this; }
        public PrescriptionMedicationDTOBuilder quantity(Integer quantity) { dto.quantity = quantity; return this; }
        public PrescriptionMedicationDTOBuilder refillInfo(String refillInfo) { dto.refillInfo = refillInfo; return this; }
        
        public PrescriptionMedicationDTO build() { return dto; }
    }
}