package com.healthcare.doctor_service.dto.telemedicine;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Mirrors telemedicine-service JoinSessionRequest.
 */
@Data
public class TelemedicineJoinSessionRequest {

    @NotNull
    private Long sessionId;

    @NotNull
    private Long userId;

    @NotBlank
    private String userRole;
}

