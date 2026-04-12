package com.healthcare.notification_service.service;

import com.healthcare.notification_service.dto.AppointmentDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");

    public boolean sendEmail(String to, String subject, String htmlContent) {
        log.info("📧 Sending email to: {}", to);

        if (fromEmail == null || fromEmail.equals("your-email@gmail.com")) {
            logMockEmail(to, subject, htmlContent);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);
            return true;
        } catch (Exception e) {
            log.error("❌ Email error: {}", e.getMessage());
            return false;
        }
    }

    private void logMockEmail(String to, String subject, String htmlContent) {
        log.info("\n╔══════════════════════════════════════════════════════════════╗");
        log.info("║  📧 MOCK EMAIL                                               ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  To: {:<50}║", to);
        log.info("║  Subject: {:<48}║",
                subject.length() > 48 ? subject.substring(0, 45) + "..." : subject);
        log.info("╚══════════════════════════════════════════════════════════════╝");
    }

    public EmailTemplate getAppointmentCreatedTemplate(AppointmentDTO appointment, String userType) {
        boolean isPatient = "patient".equals(userType);
        String name = isPatient ? appointment.getPatientName() : appointment.getDoctorName();
        String otherParty = isPatient ? appointment.getDoctorName() : appointment.getPatientName();
        String date = appointment.getDate() != null ?
                appointment.getDate().format(DATE_FORMATTER) : "Date TBD";

        String subject = "Appointment Confirmation - " + date;

        String html = String.format("""
            <!DOCTYPE html>
            <html>
            <head><style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
            </style></head>
            <body>
            <div class="container">
                <div class="header"><h1>Healthcare Platform</h1></div>
                <div class="content">
                    <h2>Hello %s!</h2>
                    <p>Your appointment has been successfully booked.</p>
                    <div class="details">
                        <h3>Appointment Details:</h3>
                        <p><strong>With:</strong> %s</p>
                        <p><strong>Date:</strong> %s</p>
                        <p><strong>Time:</strong> %s</p>
                        <p><strong>Type:</strong> Video Consultation</p>
                        %s
                        <p><strong>Status:</strong> %s</p>
                    </div>
                    %s
                    <p>Need to reschedule? Log in to your account.</p>
                </div>
                <div class="footer"><p>Healthcare Platform - Caring for your health</p></div>
            </div>
            </body>
            </html>
            """,
                name,
                otherParty,
                date,
                appointment.getTimeSlot(),
                appointment.getSymptoms() != null ?
                        "<p><strong>Symptoms:</strong> " + appointment.getSymptoms() + "</p>" : "",
                appointment.getStatus(),
                appointment.getConsultationLink() != null ?
                        "<div style='text-align: center; margin: 20px 0;'><a href='" + appointment.getConsultationLink() +
                                "' class='button'>Join Consultation</a></div>" : "");

        return new EmailTemplate(subject, html);
    }

    public EmailTemplate getAppointmentStatusUpdateTemplate(AppointmentDTO appointment, String userType, String newStatus) {
        boolean isPatient = "patient".equals(userType);
        String name = isPatient ? appointment.getPatientName() : appointment.getDoctorName();

        String statusMessage;
        switch(newStatus) {
            case "confirmed":
                statusMessage = "confirmed! Your appointment has been accepted.";
                break;
            case "cancelled":
                statusMessage = "cancelled.";
                break;
            case "completed":
                statusMessage = "completed. Thank you for using our service!";
                break;
            default:
                statusMessage = "updated to " + newStatus + ".";
        }

        String subject = "Appointment " + newStatus + " - " +
                (appointment.getDate() != null ? appointment.getDate().toLocalDate().toString() : "TBD");

        String html = String.format("""
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello %s!</h2>
                <p>Your appointment has been %s</p>
                <div style="background: #f0f0f0; padding: 15px; margin: 15px 0;">
                    <p><strong>Doctor:</strong> Dr. %s</p>
                    <p><strong>Patient:</strong> %s</p>
                    <p><strong>Date:</strong> %s</p>
                    <p><strong>New Status:</strong> %s</p>
                </div>
                %s
                <p>Healthcare Platform - Caring for your health</p>
            </div>
            """,
                name,
                statusMessage,
                appointment.getDoctorName(),
                appointment.getPatientName(),
                appointment.getDate() != null ? appointment.getDate().format(DATE_FORMATTER) : "TBD",
                newStatus,
                "confirmed".equals(newStatus) && appointment.getConsultationLink() != null ?
                        "<p><strong>Consultation Link:</strong> <a href='" + appointment.getConsultationLink() + "'>" +
                                appointment.getConsultationLink() + "</a></p>" : "");

        return new EmailTemplate(subject, html);
    }

    public record EmailTemplate(String subject, String html) {}
}