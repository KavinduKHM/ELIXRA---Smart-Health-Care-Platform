package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body for doctor-service endpoints.
 * This is then forwarded to telemedicine-service.
 */
@Data
public class DoctorCreateVideoSessionRequest {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime scheduledStartTime;
}

