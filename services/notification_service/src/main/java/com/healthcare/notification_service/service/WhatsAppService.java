package com.healthcare.notification_service.service;

import com.healthcare.notification_service.config.TwilioConfig;
import com.healthcare.notification_service.dto.AppointmentDTO;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final TwilioConfig twilioConfig;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");

    public boolean sendWhatsApp(String phoneNumber, String message) {
        // Step 1: Remove all non-digit characters
        String cleanNumber = phoneNumber.replaceAll("\\D", "");

        // Step 2: Format to E.164 standard (+94XXXXXXXXX)
        String e164Number;
        if (cleanNumber.startsWith("0")) {
            // If starts with 0 (e.g., 0757304043), replace with 94
            e164Number = "+94" + cleanNumber.substring(1);
        } else if (cleanNumber.startsWith("94")) {
            // If already has 94 (e.g., 94757304043), just add +
            e164Number = "+" + cleanNumber;
        } else {
            // Otherwise add 94 prefix
            e164Number = "+94" + cleanNumber;
        }

        // Step 3: Add whatsapp: prefix for Twilio
        String formattedNumber = "whatsapp:" + e164Number;

        log.info("📱 Original: {}, Formatted: {}", phoneNumber, formattedNumber);

        // Mock mode (if Twilio not configured)
        if (twilioConfig.getAccountSid() == null ||
                twilioConfig.getAccountSid().equals("your_account_sid_here")) {
            logMockMessage(phoneNumber, message);
            return true;
        }

        try {
            Message.creator(
                    new PhoneNumber(formattedNumber),
                    new PhoneNumber(twilioConfig.getWhatsappNumber()),
                    message
            ).create();
            log.info("✅ WhatsApp sent successfully to: {}", formattedNumber);
            return true;
        } catch (ApiException e) {
            log.error("❌ WhatsApp error: {}", e.getMessage());
            if (e.getCode() == 63016) {
                log.error("   ⚠️ Recipient not joined to WhatsApp Sandbox!");
                log.error("   Send 'join {}' to {} on WhatsApp",
                        getSandboxCode(), twilioConfig.getWhatsappNumber());
            }
            return false;
        }
    }

    private String getSandboxCode() {
        // You can get this from Twilio Console -> WhatsApp Sandbox
        // Or make it configurable
        return "mainly-lack";
    }

    private void logMockMessage(String phoneNumber, String message) {
        log.info("\n╔══════════════════════════════════════════════════════════════╗");
        log.info("║  📱 MOCK WHATSAPP MESSAGE                                    ║");
        log.info("╠══════════════════════════════════════════════════════════════╣");
        log.info("║  To: {:<50}║", phoneNumber);
        log.info("║  Message: {:<50}║",
                message.length() > 80 ? message.substring(0, 77) + "..." : message);
        log.info("╚══════════════════════════════════════════════════════════════╝");
    }

    public String getAppointmentCreatedMessage(AppointmentDTO appointment, String userType) {
        boolean isPatient = "patient".equals(userType);
        String name = isPatient ? appointment.getPatientName() : appointment.getDoctorName();
        String otherParty = isPatient ? appointment.getDoctorName() : appointment.getPatientName();
        String date = appointment.getDate() != null ?
                appointment.getDate().format(DATE_FORMATTER) : "Date TBD";

        StringBuilder message = new StringBuilder();
        message.append("🏥 *HEALTHCARE PLATFORM*\n\n");
        message.append("Hello *").append(name).append("*! 👋\n\n");
        message.append("✅ Your appointment has been *successfully booked*!\n\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append("📋 *APPOINTMENT DETAILS*\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append("👤 *With:* ").append(otherParty).append("\n");
        message.append("📅 *Date:* ").append(date).append("\n");
        message.append("⏰ *Time:* ").append(appointment.getTimeSlot()).append("\n");
        message.append("🎥 *Type:* Video Consultation 📹\n");

        if (appointment.getSymptoms() != null && !appointment.getSymptoms().isEmpty()) {
            message.append("🤒 *Symptoms:* ").append(appointment.getSymptoms()).append("\n");
        }

        message.append("📌 *Status:* ").append(appointment.getStatus().toUpperCase()).append("\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        if (appointment.getConsultationLink() != null && !appointment.getConsultationLink().isEmpty()) {
            message.append("🔗 *Join Consultation:*\n").append(appointment.getConsultationLink()).append("\n\n");
        }

        message.append("_Need to reschedule? Log in to your account._\n\n");
        message.append("💚 *Healthcare Platform* - Caring for your health");

        return message.toString();
    }

    public String getAppointmentStatusUpdateMessage(AppointmentDTO appointment, String userType, String newStatus) {
        boolean isPatient = "patient".equals(userType);
        String name = isPatient ? appointment.getPatientName() : appointment.getDoctorName();

        String statusEmoji, statusText;
        switch(newStatus.toLowerCase()) {
            case "confirmed":
                statusEmoji = "✅";
                statusText = "CONFIRMED";
                break;
            case "cancelled":
                statusEmoji = "❌";
                statusText = "CANCELLED";
                break;
            case "completed":
                statusEmoji = "🎉";
                statusText = "COMPLETED";
                break;
            default:
                statusEmoji = "📌";
                statusText = newStatus.toUpperCase();
        }

        StringBuilder message = new StringBuilder();
        message.append("🏥 *HEALTHCARE PLATFORM*\n\n");
        message.append("Hello *").append(name).append("*! 👋\n\n");
        message.append("Your appointment status has been ").append(statusEmoji).append(" *").append(statusText).append("*\n\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append("📋 *APPOINTMENT DETAILS*\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n");
        message.append("👨‍⚕️ *Doctor:* Dr. ").append(appointment.getDoctorName()).append("\n");
        message.append("👤 *Patient:* ").append(appointment.getPatientName()).append("\n");
        message.append("📅 *Date:* ").append(appointment.getDate() != null ?
                appointment.getDate().toLocalDate().toString() : "TBD").append("\n");
        message.append("⏰ *Time:* ").append(appointment.getTimeSlot()).append("\n");
        message.append("📌 *New Status:* ").append(statusEmoji).append(" ").append(statusText).append("\n");
        message.append("━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        if ("confirmed".equalsIgnoreCase(newStatus) && appointment.getConsultationLink() != null && !appointment.getConsultationLink().isEmpty()) {
            message.append("🔗 *Join Consultation:*\n").append(appointment.getConsultationLink()).append("\n\n");
        }

        message.append("💚 *Healthcare Platform* - Thank you for choosing us!");

        return message.toString();
    }
}