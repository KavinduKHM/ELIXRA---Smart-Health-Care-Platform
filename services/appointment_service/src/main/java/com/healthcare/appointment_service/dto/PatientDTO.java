package com.healthcare.appointment_service.dto;

import lombok.Data;

/**
 * DTO for patient information received from Patient Service.
 */
@Data
public class PatientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}