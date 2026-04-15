package com.healthcare.appointment_service.dto;

import lombok.Data;

@Data
public class PaymentConfirmationRequest {
    private String paymentIntentId;
    private String transactionId;
    private Long appointmentId;
}