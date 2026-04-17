package com.healthcare.telemedicine_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TokenGenerateRequest {

    @NotBlank(message = "Channel name is required")
    private String channelName;

    @NotNull(message = "User account is required")
    private Long userAccount;
}
