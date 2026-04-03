package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for doctor's available time slots.
 */
@Data
public class TimeSlotDTO {
    private Long id;
    private Long doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isBooked;
}