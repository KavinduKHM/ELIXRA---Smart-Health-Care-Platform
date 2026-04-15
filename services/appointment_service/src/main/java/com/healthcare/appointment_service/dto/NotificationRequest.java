package com.healthcare.appointment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Request payload for the notification-service POST /api/notifications/appointment endpoint.
 */
@Data
@AllArgsConstructor
public class NotificationRequest {
    private AppointmentNotificationDTO appointment;
    private String eventType;
}
