package com.healthcare.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Payload received from doctor-service to persist a prescription in patient DB.
 * Kept separate from the public PrescriptionDTO to decouple internal sync shape.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPrescriptionUpsertRequest {

    private Long patientId;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;

    private Long appointmentId;

    private LocalDateTime prescriptionDate;
    private LocalDateTime validUntil;

    private String diagnosis;
    private String notes;

    private boolean active;
    private boolean fulfilled;

    private List<Medication> medications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Medication {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String duration;
        private String timing;
        private String instructions;
        private Integer quantity;
        private String refillInfo;
    }
}

