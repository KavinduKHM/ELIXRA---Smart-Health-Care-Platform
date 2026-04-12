package com.healthcare.doctor_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DoctorRegistrationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    private String qualification;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    private String bio;

    @Positive(message = "Consultation fee must be positive")
    private Double consultationFee;

    private Integer averageConsultationDuration;
}