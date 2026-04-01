package com.healthcare.doctor_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class AvailabilityRequest {

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date cannot be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Positive(message = "Slot duration must be positive")
    private Integer slotDuration = 30;

    @Data
    public static class BulkAvailabilityRequest {
        @NotEmpty(message = "Availability list cannot be empty")
        private List<AvailabilityRequest> availabilities;
    }
}