package com.healthcare.payment_service.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String invoiceNumber;
    
    @Column(nullable = false)
    private Long transactionId;
    
    // Appointment details
    private Long appointmentId;
    private LocalDateTime appointmentDate;
    private String appointmentTimeSlot;
    
    // Patient details
    @Column(nullable = false)
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientAddress;
    
    // Doctor details
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorClinicName;
    
    // Payment details
    private String paymentMethod;
    private String cardLast4;
    private String cardBrand;
    private String transactionReference;
    
    // Invoice amounts
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal taxAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    private String currency = "LKR";
    private String description;
    private String invoiceUrl;
    
    @Column(nullable = false)
    private String status;
    
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime paidAt;
    
    public enum InvoiceStatus {
        GENERATED, SENT, PAID, VOID
    }
    
    public Invoice() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public String getAppointmentTimeSlot() { return appointmentTimeSlot; }
    public void setAppointmentTimeSlot(String appointmentTimeSlot) { this.appointmentTimeSlot = appointmentTimeSlot; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    
    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
    
    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    
    public String getPatientAddress() { return patientAddress; }
    public void setPatientAddress(String patientAddress) { this.patientAddress = patientAddress; }
    
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    
    public String getDoctorSpecialty() { return doctorSpecialty; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }
    
    public String getDoctorClinicName() { return doctorClinicName; }
    public void setDoctorClinicName(String doctorClinicName) { this.doctorClinicName = doctorClinicName; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }
    
    public String getCardBrand() { return cardBrand; }
    public void setCardBrand(String cardBrand) { this.cardBrand = cardBrand; }
    
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getInvoiceUrl() { return invoiceUrl; }
    public void setInvoiceUrl(String invoiceUrl) { this.invoiceUrl = invoiceUrl; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}