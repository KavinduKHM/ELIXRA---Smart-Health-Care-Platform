package com.healthcare.payment_service.dto;

import java.math.BigDecimal;

public class PaymentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String transactionId;
    private String status;
    private BigDecimal amount;
    private String currency;
    
    public PaymentResponse() {}
    
    public PaymentResponse(String paymentIntentId, String clientSecret, String transactionId,
                           String status, BigDecimal amount, String currency) {
        this.paymentIntentId = paymentIntentId;
        this.clientSecret = clientSecret;
        this.transactionId = transactionId;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
    }
    
    // Getters and Setters
    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}