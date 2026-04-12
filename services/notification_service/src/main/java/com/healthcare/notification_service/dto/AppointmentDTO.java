package com.healthcare.notification_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDTO {
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