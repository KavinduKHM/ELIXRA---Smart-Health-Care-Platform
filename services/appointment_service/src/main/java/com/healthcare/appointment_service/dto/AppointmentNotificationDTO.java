package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO matching the AppointmentDTO expected by the notification-service API.
 */
@Data
public class AppointmentNotificationDTO {
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String doctorId;
    private String doctorName;
    private String doctorEmail;
    private String doctorPhone;
    private String specialty;
    private LocalDateTime date;
    private String timeSlot;
    private String status;
    private String consultationType;
    private String consultationLink;
    private String symptoms;
    private String notes;
}
