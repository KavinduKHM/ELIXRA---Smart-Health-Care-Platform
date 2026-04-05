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
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@Valid @RequestBody PaymentRequest request) {
        log.info("POST /api/payments/create-intent - Appointment: {}", request.getAppointmentId());
        PaymentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/confirm")
    public ResponseEntity<TransactionDTO> confirmPayment(@Valid @RequestBody PaymentConfirmationDTO confirmation) {
        log.info("POST /api/payments/confirm - Intent: {}", confirmation.getPaymentIntentId());
        TransactionDTO transaction = paymentService.confirmPayment(confirmation);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable String transactionId) {
        log.info("GET /api/payments/transactions/{}", transactionId);
        TransactionDTO transaction = paymentService.getTransaction(transactionId);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/patients/{patientId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getPatientTransactions(@PathVariable Long patientId) {
        log.info("GET /api/payments/patients/{}/transactions", patientId);
        List<TransactionDTO> transactions = paymentService.getPatientTransactions(patientId);
        return ResponseEntity.ok(transactions);
    }
}