package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for doctor availability blocks received from Doctor Service.
 * Mirrors doctor-service AvailabilityDTO JSON.
 */
@Data
public class DoctorAvailabilityDTO {
    private Long id;
    private Long doctorId;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private String status;
}
