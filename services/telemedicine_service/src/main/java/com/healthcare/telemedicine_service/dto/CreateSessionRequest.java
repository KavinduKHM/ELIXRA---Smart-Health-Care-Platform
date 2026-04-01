package com.healthcare.telemedicine.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a new video session.
 *
 * Sent by the Appointment Service when a new appointment is confirmed.
 */
@Data
public class CreateSessionRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStartTime;
}