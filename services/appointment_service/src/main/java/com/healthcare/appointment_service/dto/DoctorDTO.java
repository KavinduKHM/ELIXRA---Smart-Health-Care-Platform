package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for doctor information received from Doctor Service.
 * Must be compatible with doctor-service's DoctorDTO JSON.
 */
@Data
public class DoctorDTO {
    private Long id;
    private Long userId;

    private String firstName;
    private String lastName;
    /**
     * doctor-service sends fullName explicitly.
     */
    private String fullName;

    private String email;
    private String phoneNumber;
    private String profilePicture;

    private String specialty;
    private String qualification;
    private Integer experienceYears;
    private String bio;

    private Double consultationFee;
    private Integer averageConsultationDuration;
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalPatients;

    private Boolean available;
    private LocalDateTime createdAt;

    /**
     * Backward-compatible helper when fullName isn't provided.
     */
    public String getFullName() {
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }
        String fn = firstName == null ? "" : firstName.trim();
        String ln = lastName == null ? "" : lastName.trim();
        return (fn + " " + ln).trim();
    }
}