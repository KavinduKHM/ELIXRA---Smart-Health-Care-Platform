package com.healthcare.appointment_service.dto;

import com.healthcare.appointment_service.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning appointment details to clients.
 * Includes patient and doctor details (populated by other services).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private Long id;
    private Long patientId;
    private String patientName;      // From Patient Service
    private Long doctorId;
    private String doctorName;       // From Doctor Service
    private String doctorSpecialty;  // From Doctor Service
    private LocalDateTime appointmentTime;
    private Integer durationMinutes;
    private AppointmentStatus status;
    private String symptoms;
    private String notes;
    private String consultationLink;
    private boolean prescriptionIssued;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper method to check if appointment can be cancelled
    public boolean isCancellable() {
        return (status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED)
                && LocalDateTime.now().plusHours(1).isBefore(appointmentTime);
    }

    // Helper method to check if appointment can be rescheduled
    public boolean isReschedulable() {
        return (status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED)
                && LocalDateTime.now().plusHours(1).isBefore(appointmentTime);
    }
}