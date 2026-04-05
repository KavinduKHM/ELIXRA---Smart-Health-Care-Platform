package com.healthcare.payment_service.controller;

import com.healthcare.payment_service.dto.PaymentConfirmationDTO;
import com.healthcare.payment_service.dto.PaymentRequest;
import com.healthcare.payment_service.dto.PaymentResponse;
import com.healthcare.payment_service.dto.TransactionDTO;
import com.healthcare.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    /**
     * Create a payment intent with Stripe
     * Prevents duplicate payments for the same appointment
     */
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        log.info("POST /api/payments/create-intent - Appointment: {}", request.getAppointmentId());
        PaymentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Confirm a payment after successful payment processing
     * Updates the transaction status in the database
     */
    @PostMapping("/confirm")
    public ResponseEntity<TransactionDTO> confirmPayment(@Valid @RequestBody PaymentConfirmationDTO confirmation) {
        log.info("POST /api/payments/confirm - Intent: {}", confirmation.getPaymentIntentId());
        TransactionDTO transaction = paymentService.confirmPayment(confirmation);
        return ResponseEntity.ok(transaction);
    }
    
    /**
     * Get transaction details by transaction ID
     */
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable String transactionId) {
        log.info("GET /api/payments/transactions/{}", transactionId);
        TransactionDTO transaction = paymentService.getTransaction(transactionId);
        return ResponseEntity.ok(transaction);
    }
    
    /**
     * Get all transactions for a specific patient
     */
    @GetMapping("/patients/{patientId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getPatientTransactions(@PathVariable Long patientId) {
        log.info("GET /api/payments/patients/{}/transactions", patientId);
        List<TransactionDTO> transactions = paymentService.getPatientTransactions(patientId);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * Check if an appointment has been paid successfully
     * This prevents duplicate payments
     */
    @GetMapping("/appointments/{appointmentId}/paid")
    public ResponseEntity<Map<String, Object>> isAppointmentPaid(@PathVariable Long appointmentId) {
        log.info("GET /api/payments/appointments/{}/paid", appointmentId);
        boolean isPaid = paymentService.isAppointmentPaid(appointmentId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("appointmentId", appointmentId);
        response.put("isPaid", isPaid);
        response.put("message", isPaid ? "Appointment has been paid" : "Appointment is not paid yet");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get the successful transaction for a specific appointment
     * Returns the payment details if the appointment has been paid
     */
    @GetMapping("/appointments/{appointmentId}/transaction")
    public ResponseEntity<TransactionDTO> getAppointmentTransaction(@PathVariable Long appointmentId) {
        log.info("GET /api/payments/appointments/{}/transaction", appointmentId);
        TransactionDTO transaction = paymentService.getSuccessfulTransactionByAppointment(appointmentId);
        
        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(transaction);
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "payment-service");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
}