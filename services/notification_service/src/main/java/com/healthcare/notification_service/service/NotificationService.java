package com.healthcare.notification_service.service;

import com.healthcare.notification_service.dto.AppointmentDTO;
import com.healthcare.notification_service.model.Notification;
import com.healthcare.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WhatsAppService whatsAppService;
    private final EmailService emailService;

    public NotificationResult sendAppointmentNotifications(AppointmentDTO appointment, String eventType) {
        log.info("📢 Sending {} notifications for appointment: {}", eventType, appointment.getAppointmentId());

        NotificationResult patientResult = sendToUser(appointment, eventType, "patient");
        NotificationResult doctorResult = sendToUser(appointment, eventType, "doctor");

        return new NotificationResult(patientResult, doctorResult, eventType);
    }

    private NotificationResult sendToUser(AppointmentDTO appointment, String eventType, String userType) {
        boolean isPatient = "patient".equals(userType);
        String userId = isPatient ? appointment.getPatientId() : appointment.getDoctorId();
        String email = isPatient ? appointment.getPatientEmail() : appointment.getDoctorEmail();
        String phone = isPatient ? appointment.getPatientPhone() : appointment.getDoctorPhone();
        String name = isPatient ? appointment.getPatientName() : appointment.getDoctorName();

        String whatsappMessage;
        EmailService.EmailTemplate emailTemplate;

        if ("created".equals(eventType)) {
            whatsappMessage = whatsAppService.getAppointmentCreatedMessage(appointment, userType);
            emailTemplate = emailService.getAppointmentCreatedTemplate(appointment, userType);
        } else {
            whatsappMessage = whatsAppService.getAppointmentStatusUpdateMessage(
                    appointment, userType, appointment.getStatus());
            emailTemplate = emailService.getAppointmentStatusUpdateTemplate(
                    appointment, userType, appointment.getStatus());
        }

        boolean whatsappSent = false;
        if (phone != null && !phone.isEmpty()) {
            whatsappSent = whatsAppService.sendWhatsApp(phone, whatsappMessage);
            saveNotification(userId, userType, "whatsapp", null, phone,
                    whatsappMessage.length() > 500 ? whatsappMessage.substring(0, 500) : whatsappMessage,
                    appointment.getAppointmentId(), whatsappSent);
        }

        boolean emailSent = false;
        if (email != null && !email.isEmpty()) {
            emailSent = emailService.sendEmail(email, emailTemplate.subject(), emailTemplate.html());
            saveNotification(userId, userType, "email", email, null, emailTemplate.subject(),
                    appointment.getAppointmentId(), emailSent);
        }

        log.info("📬 Notifications sent to {}: WhatsApp={}, Email={}", name, whatsappSent, emailSent);

        return new NotificationResult(userId, name, whatsappSent, emailSent);
    }

    private void saveNotification(String userId, String userType, String type,
                                  String recipientEmail, String recipientPhone,
                                  String message, String appointmentId, boolean sent) {
        Notification notification = Notification.builder()
                .notificationId(UUID.randomUUID().toString())
                .userId(userId)
                .userType(userType)
                .type(type)
                .recipientEmail(recipientEmail)
                .recipientPhone(recipientPhone)
                .message(message)
                .appointmentId(appointmentId)
                .status(sent ? "sent" : "failed")
                .sentAt(sent ? LocalDateTime.now() : null)
                .build();

        notificationRepository.save(notification);
        log.debug("💾 Notification saved: {}", notification.getNotificationId());
    }

    public List<Notification> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getFailedNotifications() {
        return notificationRepository.findByStatus("failed");
    }

    public record NotificationResult(String userId, String name, boolean whatsappSent, boolean emailSent) {
        public NotificationResult(NotificationResult patient, NotificationResult doctor, String eventType) {
            this(patient.userId + "," + doctor.userId, "Both",
                    patient.whatsappSent && doctor.whatsappSent,
                    patient.emailSent && doctor.emailSent);
        }
    }
}