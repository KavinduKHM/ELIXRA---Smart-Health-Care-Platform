package com.healthcare.doctor_service.dto.telemedicine;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Mirrors telemedicine-service EndSessionRequest.
 */
@Data
public class TelemedicineEndSessionRequest {

    @NotNull
    private Long sessionId;

    @NotNull
    private Long userId;

    private String consultationNotes;
}

