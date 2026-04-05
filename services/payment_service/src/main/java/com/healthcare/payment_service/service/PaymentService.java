package com.healthcare.payment_service.service;

import com.healthcare.payment_service.dto.PaymentConfirmationDTO;
import com.healthcare.payment_service.dto.PaymentRequest;
import com.healthcare.payment_service.dto.PaymentResponse;
import com.healthcare.payment_service.dto.TransactionDTO;
import com.healthcare.payment_service.model.Transaction;
import com.healthcare.payment_service.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    
    private final TransactionRepository transactionRepository;
    private final InvoiceService invoiceService;
    
    @Value("${stripe.api.secret-key:sk_test_dummy}")
    private String stripeSecretKey;
    
    public PaymentService(TransactionRepository transactionRepository, InvoiceService invoiceService) {
        this.transactionRepository = transactionRepository;
        this.invoiceService = invoiceService;
    }
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe initialized");
    }
    
    @Transactional
    public PaymentResponse createPaymentIntent(PaymentRequest request) {
        log.info("Creating payment intent for appointment: {}", request.getAppointmentId());
        
        try {
            long amountInCents = request.getAmount().longValue();
            
            // Build the PaymentIntent parameters
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(request.getCurrency().toLowerCase())
                .setDescription(request.getDescription())
                .putMetadata("appointmentId", String.valueOf(request.getAppointmentId()))
                .putMetadata("patientId", String.valueOf(request.getPatientId()))
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                        .build()
                );
            
            // Add return URL if provided (for redirect-based payment methods)
            if (request.getReturnUrl() != null && !request.getReturnUrl().isEmpty()) {
                paramsBuilder.setReturnUrl(request.getReturnUrl());
            }
            
            // If payment method ID is provided, confirm immediately
            if (request.getPaymentMethodId() != null && !request.getPaymentMethodId().isEmpty()) {
                paramsBuilder.setPaymentMethod(request.getPaymentMethodId());
                paramsBuilder.setConfirm(true);
            }
            
            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            log.info("PaymentIntent created: {}", paymentIntent.getId());
            
            String transactionId = "TXN-" + System.currentTimeMillis() + "-" + 
                UUID.randomUUID().toString().substring(0, 8);
            
            Transaction transaction = new Transaction(
                transactionId,
                paymentIntent.getId(),
                request.getAppointmentId(),
                request.getPatientId(),
                request.getDoctorId(),
                request.getAmount(),
                request.getCurrency(),
                Transaction.TransactionStatus.PENDING.name(),
                request.getDescription()
            );
            
            // Set payment method if provided
            if (request.getPaymentMethodId() != null) {
                transaction.setPaymentMethod(request.getPaymentMethodId());
            }
            
            transactionRepository.save(transaction);
            log.info("Transaction saved with ID: {}", transactionId);
            
            return new PaymentResponse(
                paymentIntent.getId(),
                paymentIntent.getClientSecret(),
                transactionId,
                paymentIntent.getStatus(),
                request.getAmount(),
                request.getCurrency()
            );
            
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }
    
    @Transactional
    public TransactionDTO confirmPayment(PaymentConfirmationDTO confirmation) {
        log.info("Confirming payment for intent: {}", confirmation.getPaymentIntentId());
        
        // First, get the transaction from database
        Transaction transaction = transactionRepository
            .findByTransactionId(confirmation.getTransactionId())
            .orElseThrow(() -> new RuntimeException("Transaction not found: " + confirmation.getTransactionId()));
        
        try {
            // Retrieve the PaymentIntent from Stripe
            PaymentIntent paymentIntent = PaymentIntent.retrieve(confirmation.getPaymentIntentId());
            
            log.info("Current PaymentIntent status: {}", paymentIntent.getStatus());
            
            // Check if payment is already succeeded
            if ("succeeded".equals(paymentIntent.getStatus())) {
                transaction.setStatus(Transaction.TransactionStatus.SUCCEEDED.name());
                transaction.setPaidAt(LocalDateTime.now());
                transactionRepository.save(transaction);
                invoiceService.generateInvoice(transaction);
                log.info("Payment already succeeded for transaction: {}", transaction.getTransactionId());
            } 
            // If payment requires confirmation, confirm it
            else if ("requires_confirmation".equals(paymentIntent.getStatus()) || 
                     "requires_payment_method".equals(paymentIntent.getStatus())) {
                
                // Confirm the payment intent with Stripe
                PaymentIntent confirmedIntent = paymentIntent.confirm();
                log.info("Confirmed PaymentIntent status: {}", confirmedIntent.getStatus());
                
                if ("succeeded".equals(confirmedIntent.getStatus())) {
                    transaction.setStatus(Transaction.TransactionStatus.SUCCEEDED.name());
                    transaction.setPaidAt(LocalDateTime.now());
                    transactionRepository.save(transaction);
                    invoiceService.generateInvoice(transaction);
                    log.info("Payment succeeded for transaction: {}", transaction.getTransactionId());
                } else {
                    transaction.setStatus(confirmedIntent.getStatus());
                    transactionRepository.save(transaction);
                }
            } 
            else if ("failed".equals(paymentIntent.getStatus())) {
                transaction.setStatus(Transaction.TransactionStatus.FAILED.name());
                if (paymentIntent.getLastPaymentError() != null) {
                    transaction.setFailureReason(paymentIntent.getLastPaymentError().getMessage());
                }
                transactionRepository.save(transaction);
            }
            
            return mapToDTO(transaction);
            
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            transaction.setStatus(Transaction.TransactionStatus.FAILED.name());
            transaction.setFailureReason(e.getMessage());
            transactionRepository.save(transaction);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        }
    }
    
    public TransactionDTO getTransaction(String transactionId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));
        return mapToDTO(transaction);
    }
    
    public List<TransactionDTO> getPatientTransactions(Long patientId) {
        return transactionRepository.findByPatientId(patientId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private TransactionDTO mapToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setTransactionId(transaction.getTransactionId());
        dto.setStripePaymentIntentId(transaction.getStripePaymentIntentId());
        dto.setAppointmentId(transaction.getAppointmentId());
        dto.setPatientId(transaction.getPatientId());
        dto.setDoctorId(transaction.getDoctorId());
        dto.setAmount(transaction.getAmount());
        dto.setCurrency(transaction.getCurrency());
        dto.setStatus(transaction.getStatus());
        dto.setDescription(transaction.getDescription());
        dto.setFailureReason(transaction.getFailureReason());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setPaidAt(transaction.getPaidAt());
        return dto;
    }
}