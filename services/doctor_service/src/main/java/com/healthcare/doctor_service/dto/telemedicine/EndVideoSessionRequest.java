package com.healthcare.doctor_service.dto.telemedicine;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for doctor-service endpoint: POST /api/doctors/video/sessions/end
 */
@Data
public class EndVideoSessionRequest {

    @NotNull
    private Long sessionId;

    @NotNull
    private Long doctorId;

    private String consultationNotes;
}
