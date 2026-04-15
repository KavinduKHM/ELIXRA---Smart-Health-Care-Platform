package com.healthcare.appointment_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class NotificationServiceClientFallback implements NotificationServiceClient {

    @Override
    public Map<String, Object> sendAppointmentNotifications(Map<String, Object> request) {
        log.warn("Notification service unavailable. Appointment notification not sent.");
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("success", false);
        fallback.put("message", "Notification service unavailable");
        return fallback;
    }
}