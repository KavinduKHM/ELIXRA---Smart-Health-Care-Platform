package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(
        name = "notification-service",
        url = "${app.notification.url:http://notification-service:3002}",
        fallback = NotificationServiceClientFallback.class
)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/appointment")
    Map<String, Object> sendAppointmentNotifications(@RequestBody NotificationRequest request);
}
