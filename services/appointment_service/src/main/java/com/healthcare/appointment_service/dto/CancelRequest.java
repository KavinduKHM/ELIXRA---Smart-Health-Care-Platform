package com.healthcare.appointment_service.dto;

import lombok.Data;

/**
 * DTO for cancelling an appointment with a reason.
 */
@Data
public class CancelRequest {
    private String reason;
}