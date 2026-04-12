package com.healthcare.telemedicine.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for ending a video session.
 *
 * Sent by the frontend when the video consultation is completed.
 */
@Data
public class EndSessionRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String consultationNotes;  // Optional notes from doctor
}