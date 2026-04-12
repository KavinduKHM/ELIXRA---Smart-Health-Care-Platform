package com.healthcare.payment_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentRequest {
    
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;
    
    private Long doctorId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    private String currency = "LKR";
    private String description;
    private String paymentMethodId;
    private String returnUrl;
    
    // Additional fields for invoice
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDateTime appointmentDate;
    private String appointmentTimeSlot;
    
    // Getters and Setters
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getPaymentMethodId() { return paymentMethodId; }
    public void setPaymentMethodId(String paymentMethodId) { this.paymentMethodId = paymentMethodId; }
    
    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
    
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    
    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }
    
    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }
    
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    
    public String getDoctorSpecialty() { return doctorSpecialty; }
    public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }
    
    public LocalDateTime getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDateTime appointmentDate) { this.appointmentDate = appointmentDate; }
    
    public String getAppointmentTimeSlot() { return appointmentTimeSlot; }
    public void setAppointmentTimeSlot(String appointmentTimeSlot) { this.appointmentTimeSlot = appointmentTimeSlot; }
}