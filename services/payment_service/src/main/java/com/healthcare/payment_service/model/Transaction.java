package com.healthcare.payment_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String transactionId;
    
    @Column(unique = true, nullable = false)
    private String stripePaymentIntentId;
    
    @Column(nullable = false)
    private Long appointmentId;
    
    @Column(nullable = false)
    private Long patientId;
    
    private Long doctorId;
    
    // Additional fields for invoice
    private String doctorName;
    private String doctorSpecialty;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private LocalDateTime appointmentDate;
    private String appointmentTimeSlot;
    private String consultationType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    private String currency = "LKR";
    
    @Column(nullable = false)
    private String status;
    
    private String paymentMethod;
    private String cardLast4;
    private String cardBrand;
    
    private String description;
    
    @Column(length = 1000)
    private String failureReason;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;
    
    public enum TransactionStatus {
        PENDING, SUCCEEDED, FAILED, REFUNDED, CANCELLED
    }
    
    public Transaction() {}
    
    public Transaction(String transactionId, String stripePaymentIntentId, Long appointmentId,
                       Long patientId, Long doctorId, BigDecimal amount, String currency,
                       String status, String description) {
        this.transactionId = transactionId;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.appointmentId = appointmentId;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }
    
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    
    public String getDoctorSpecialty() { return doctorSpecialty; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }
    
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    
    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
    
    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public String getAppointmentTimeSlot() { return appointmentTimeSlot; }
    public void setAppointmentTimeSlot(String appointmentTimeSlot) { this.appointmentTimeSlot = appointmentTimeSlot; }
    
    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }
    
    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    
    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }
}