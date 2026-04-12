package com.healthcare.appointment_service.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for rescheduling an existing appointment.
 */
@Data
public class RescheduleRequest {

    @NotNull(message = "New appointment time is required")
    @Future(message = "New time must be in the future")
    private LocalDateTime newAppointmentTime;

    private String reason;
}