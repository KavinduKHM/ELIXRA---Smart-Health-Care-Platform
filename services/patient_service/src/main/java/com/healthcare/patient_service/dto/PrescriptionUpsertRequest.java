package com.healthcare.patient_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Payload sent by doctor-service when a prescription is issued.
 *
 * We keep it separate from the read-model DTO to avoid accidental tight coupling.
 */
public class PrescriptionUpsertRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    private String doctorName;
    private String doctorSpecialty;

    @NotNull
    private Long appointmentId;

    @NotNull
    private LocalDateTime prescriptionDate;

    private LocalDateTime validUntil;

    private String diagnosis;
    private String notes;

    private boolean active = true;
    private boolean fulfilled = false;

    @Valid
    private List<Medication> medications;

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialty() {
        return doctorSpecialty;
    }

    public void setDoctorSpecialty(String doctorSpecialty) {
        this.doctorSpecialty = doctorSpecialty;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public LocalDateTime getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDateTime prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isFulfilled() {
        return fulfilled;
    }

    public void setFulfilled(boolean fulfilled) {
        this.fulfilled = fulfilled;
    }

    public List<Medication> getMedications() {
        return medications;
    }

    public void setMedications(List<Medication> medications) {
        this.medications = medications;
    }

    public static class Medication {
        @NotNull
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String timing;
        private String instructions;
        private Integer quantity;
        private String refillInfo;

        public String getMedicationName() {
            return medicationName;
        }

        public void setMedicationName(String medicationName) {
            this.medicationName = medicationName;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public String getDuration() {
            return duration;
        }

        public void setDuration(String duration) {
            this.duration = duration;
        }

        public String getTiming() {
            return timing;
        }

        public void setTiming(String timing) {
            this.timing = timing;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getRefillInfo() {
            return refillInfo;
        }

        public void setRefillInfo(String refillInfo) {
            this.refillInfo = refillInfo;
        }
    }
}

