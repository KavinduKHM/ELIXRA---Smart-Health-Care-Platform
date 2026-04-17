package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class NotificationServiceClientFallback implements NotificationServiceClient {

    @Override
    public Map<String, Object> sendAppointmentNotifications(NotificationRequest request) {
        String appointmentId = request != null && request.getAppointment() != null
                ? request.getAppointment().getAppointmentId()
                : "unknown";
        log.warn("Notification service unavailable; skipping notifications for appointment {}", appointmentId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", false);
        resp.put("message", "notification-service unavailable (fallback)");
        return resp;
    }
}
