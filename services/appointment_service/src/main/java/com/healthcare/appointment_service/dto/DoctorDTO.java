package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for doctor information received from Doctor Service.
 * Matches the format expected from doctor-service.
 */
@Data
public class DoctorDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private String specialty;
    private String qualification;
    private String email;
    private String phoneNumber;

    private Double consultationFee;

    private Integer experienceYears;
    private Double averageRating;

    private Boolean available;
    private List<TimeSlotDTO> availableSlots;

    public String getFullName() {
        String first = firstName == null ? "" : firstName;
        String last = lastName == null ? "" : lastName;
        return (first + " " + last).trim();
    }
}