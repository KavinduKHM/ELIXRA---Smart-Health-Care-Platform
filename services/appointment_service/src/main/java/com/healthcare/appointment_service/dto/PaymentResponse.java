package com.healthcare.appointment_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String transactionId;
    private String status;
    private BigDecimal amount;
    private String currency;
}