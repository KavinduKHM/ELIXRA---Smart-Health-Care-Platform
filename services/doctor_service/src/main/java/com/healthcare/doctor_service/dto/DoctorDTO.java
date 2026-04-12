package com.healthcare.doctor_service.dto;

import com.healthcare.doctor_service.model.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {

    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
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
    private Doctor.DoctorStatus status;
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalPatients;
    private LocalDateTime createdAt;

    /**
     * Convert Doctor entity to DTO
     */
    public static DoctorDTO fromEntity(Doctor doctor) {
        if (doctor == null) {
            return null;
        }

        return DoctorDTO.builder()
                .id(doctor.getId())
                .userId(doctor.getUserId())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .fullName(doctor.getFullName())
                .email(doctor.getEmail())
                .phoneNumber(doctor.getPhoneNumber())
                .profilePicture(doctor.getProfilePicture())
                .specialty(doctor.getSpecialty())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .bio(doctor.getBio())
                .consultationFee(doctor.getConsultationFee())
                .averageConsultationDuration(doctor.getAverageConsultationDuration())
                .status(doctor.getStatus())
                .averageRating(doctor.getAverageRating())
                .totalReviews(doctor.getTotalReviews())
                .totalPatients(doctor.getTotalPatients())
                .createdAt(doctor.getCreatedAt())
                .build();
    }
}