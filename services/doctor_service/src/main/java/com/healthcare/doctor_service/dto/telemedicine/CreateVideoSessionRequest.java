package com.healthcare.doctor_service.dto.telemedicine;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for doctor-service endpoint: POST /api/doctors/video/sessions
 *
 * Doctor initiates a telemedicine session.
 */
@Data
public class CreateVideoSessionRequest {

    @NotNull
    private Long appointmentId;

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    @NotNull
    private LocalDateTime scheduledStartTime;
}

