package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

/**
 * Feign client for calling Notification Service.
 * Sends appointment lifecycle notifications (created, confirmed, completed, cancelled).
 */
@FeignClient(name = "notification-service", url = "http://notification-service:8088", path = "/api/notifications")
public interface NotificationServiceClient {

    @PostMapping("/appointment")
    Map<String, Object> sendAppointmentNotification(@RequestBody NotificationRequest request);
}
