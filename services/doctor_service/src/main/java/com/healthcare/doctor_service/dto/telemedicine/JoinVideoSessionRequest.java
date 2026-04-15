package com.healthcare.doctor_service.dto.telemedicine;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for doctor-service endpoint: POST /api/doctors/video/sessions/join
 */
@Data
public class JoinVideoSessionRequest {

    @NotNull
    private Long sessionId;

    @NotNull
    private Long doctorId;
}
