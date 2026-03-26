package com.healthcare.appointment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for doctor search results.
 * Contains doctor information and available slots for booking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSearchResponse {
    private Long id;
    private String name;
    private String specialty;
    private String qualification;
    private String profilePicture;
    private Double consultationFee;
    private Double rating;
    private Integer experienceYears;
    private List<TimeSlotDTO> availableSlots;
}