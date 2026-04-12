package com.healthcare.appointment_service.dto;

import com.healthcare.appointment_service.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for updating appointment status (doctor confirms/cancels).
 */
@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    private String notes;
}
