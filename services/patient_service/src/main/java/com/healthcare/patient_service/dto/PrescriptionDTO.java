package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PrescriptionDTO {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private Long appointmentId;

    // doctor-service sends this field as `issuedAt`
    @JsonAlias({"issuedAt", "prescriptionDate"})
    private LocalDateTime prescriptionDate;

    private LocalDateTime validUntil;
    private String diagnosis;
    private String notes;

    // doctor-service sends this field as `medicines`
    @JsonAlias({"medicines", "medications"})
    private List<PrescriptionMedicationDTO> medications;

    // some services may send these fields; keep them optional
    @JsonAlias({"active", "isActive"})
    private Boolean isActive;

    @JsonAlias({"fulfilled", "isFulfilled"})
    private Boolean isFulfilled;

    private LocalDateTime createdAt;

    public PrescriptionDTO() {}

    public static PrescriptionDTOBuilder builder() {
        return new PrescriptionDTOBuilder();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorSpecialty() { return doctorSpecialty; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public LocalDateTime getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(LocalDateTime prescriptionDate) { this.prescriptionDate = prescriptionDate; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<PrescriptionMedicationDTO> getMedications() { return medications; }
    public void setMedications(List<PrescriptionMedicationDTO> medications) { this.medications = medications; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Boolean getIsFulfilled() { return isFulfilled; }
    public void setIsFulfilled(Boolean fulfilled) { isFulfilled = fulfilled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static class PrescriptionDTOBuilder {
        private final PrescriptionDTO dto = new PrescriptionDTO();

        public PrescriptionDTOBuilder id(Long id) { dto.id = id; return this; }
        public PrescriptionDTOBuilder patientId(Long patientId) { dto.patientId = patientId; return this; }
        public PrescriptionDTOBuilder doctorId(Long doctorId) { dto.doctorId = doctorId; return this; }
        public PrescriptionDTOBuilder doctorName(String doctorName) { dto.doctorName = doctorName; return this; }
        public PrescriptionDTOBuilder doctorSpecialty(String specialty) { dto.doctorSpecialty = specialty; return this; }
        public PrescriptionDTOBuilder appointmentId(Long appointmentId) { dto.appointmentId = appointmentId; return this; }
        public PrescriptionDTOBuilder prescriptionDate(LocalDateTime date) { dto.prescriptionDate = date; return this; }
        public PrescriptionDTOBuilder validUntil(LocalDateTime validUntil) { dto.validUntil = validUntil; return this; }
        public PrescriptionDTOBuilder diagnosis(String diagnosis) { dto.diagnosis = diagnosis; return this; }
        public PrescriptionDTOBuilder notes(String notes) { dto.notes = notes; return this; }
        public PrescriptionDTOBuilder medications(List<PrescriptionMedicationDTO> meds) { dto.medications = meds; return this; }
        public PrescriptionDTOBuilder isActive(Boolean active) { dto.isActive = active; return this; }
        public PrescriptionDTOBuilder isFulfilled(Boolean fulfilled) { dto.isFulfilled = fulfilled; return this; }
        public PrescriptionDTOBuilder createdAt(LocalDateTime createdAt) { dto.createdAt = createdAt; return this; }

        public PrescriptionDTO build() { return dto; }
    }
}