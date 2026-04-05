package com.healthcare.notification_service.controller;

import com.healthcare.notification_service.dto.AppointmentDTO;
import com.healthcare.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/appointment")
    public ResponseEntity<Map<String, Object>> sendAppointmentNotifications(
            @RequestBody NotificationRequest request) {

        var result = notificationService.sendAppointmentNotifications(
                request.getAppointment(),
                request.getEventType()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifications sent successfully");
        response.put("data", result);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/failed")
    public ResponseEntity<?> getFailedNotifications() {
        return ResponseEntity.ok(notificationService.getFailedNotifications());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "notification-service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Notification Service");
        response.put("version", "1.0.0");
        response.put("endpoints", new String[]{
                "POST /api/notifications/appointment",
                "GET /api/notifications/user/{userId}",
                "GET /api/notifications/failed",
                "GET /api/notifications/health"
        });
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    public static class NotificationRequest {
        private AppointmentDTO appointment;
        private String eventType;
    }
}