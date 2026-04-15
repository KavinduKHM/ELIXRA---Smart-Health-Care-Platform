package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.AppointmentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "notification-service", fallback = NotificationServiceClientFallback.class)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/appointment")
    Map<String, Object> sendAppointmentNotifications(@RequestBody Map<String, Object> request);
}