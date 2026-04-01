package com.healthcare.doctor_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PrescriptionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    private String diagnosis;

    private String notes;

    @NotNull(message = "Valid until date is required")
    @Future(message = "Valid until must be in the future")
    private LocalDateTime validUntil;

    @NotEmpty(message = "At least one medicine is required")
    private List<MedicineRequest> medicines;

    @Data
    public static class MedicineRequest {
        @NotBlank(message = "Medicine name is required")
        private String medicineName;

        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }
}