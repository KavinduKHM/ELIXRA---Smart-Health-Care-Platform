package com.healthcare.appointment_service.dto;

import lombok.Data;

@Data
public class NotificationRequest {
    private NotificationAppointmentDTO appointment;
    private String eventType;
}
