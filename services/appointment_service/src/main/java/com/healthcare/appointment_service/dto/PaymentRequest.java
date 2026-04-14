package com.healthcare.appointment_service.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentRequest {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private BigDecimal amount;
    private String currency = "LKR";
    private String description;
    private String paymentMethodId;
    private String returnUrl;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDateTime appointmentDate;
    private String appointmentTimeSlot;
}