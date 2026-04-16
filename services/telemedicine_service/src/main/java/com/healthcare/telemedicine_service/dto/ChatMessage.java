package com.healthcare.telemedicine_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;

@Data
public class ChatMessage {

    @NotNull(message = "senderId is required")
    private Long senderId;

    @NotBlank(message = "message is required")
    @Size(max = 1000, message = "message must be <= 1000 characters")
    private String message;

    // server sets
    private Instant timestamp;
}
