package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO matching the availability slot object returned by doctor-service.
 *
 * doctor-service endpoint: GET /api/doctors/{doctorId}/availability/slots?date=YYYY-MM-DD
 */
@Data
public class AvailabilityDTO {
    private Long id;
    private Long doctorId;

    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private Integer slotDuration;
    /**
     * Serialized as enum name from doctor-service (e.g., AVAILABLE, BOOKED, CANCELLED).
     */
    private String status;
}
