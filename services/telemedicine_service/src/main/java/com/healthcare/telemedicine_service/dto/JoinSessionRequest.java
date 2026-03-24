package com.healthcare.telemedicine_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for joining a video session.
 *
 * Sent by the frontend when a patient or doctor wants to start a video call.
 */
@Data
public class JoinSessionRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "User role is required")
    private String userRole;  // "PATIENT" or "DOCTOR"
}