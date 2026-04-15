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
    
    /**
     * If a previous transaction exists for the appointment:
     * - SUCCEEDED => payment already completed (do not create a new intent)
     * - PENDING   => return the existing intent/transaction so clients can resume payment
     */
    private Transaction getExistingActiveTransaction(Long appointmentId) {
        List<Transaction> existingTransactions = transactionRepository.findByAppointmentId(appointmentId);

        // Prefer latest transaction (best-effort ordering by created time when present)
        Transaction best = null;
        for (Transaction t : existingTransactions) {
            if (best == null) {
                best = t;
                continue;
            }
            if (t.getCreatedAt() != null && best.getCreatedAt() != null && t.getCreatedAt().isAfter(best.getCreatedAt())) {
                best = t;
            }
        }

        if (best == null) return null;

        if (Transaction.TransactionStatus.SUCCEEDED.name().equals(best.getStatus()) ||
            Transaction.TransactionStatus.PENDING.name().equals(best.getStatus())) {
            log.warn("Existing transaction found for appointment: {}. transactionId={} status={}",
                appointmentId, best.getTransactionId(), best.getStatus());
            return best;
        }

        return null;
    }
    

    @Transactional
    public PaymentResponse createPaymentIntent(PaymentRequest request) {
        log.info("Creating payment intent for appointment: {}", request.getAppointmentId());

        // If we already have an active transaction, return it (PENDING) or block (SUCCEEDED)
        Transaction existing = getExistingActiveTransaction(request.getAppointmentId());
        if (existing != null) {
            if (Transaction.TransactionStatus.SUCCEEDED.name().equals(existing.getStatus())) {
                throw new RuntimeException("Payment already processed for appointment: " + request.getAppointmentId() +
                        ". Duplicate payments are not allowed.");
            }

            try {
                PaymentIntent existingIntent = PaymentIntent.retrieve(existing.getStripePaymentIntentId());

                // If intent already succeeded, update DB (idempotent)
                if ("succeeded".equals(existingIntent.getStatus()) &&
                    !Transaction.TransactionStatus.SUCCEEDED.name().equals(existing.getStatus())) {
                    existing.setStatus(Transaction.TransactionStatus.SUCCEEDED.name());
                    existing.setPaidAt(LocalDateTime.now());
                    transactionRepository.save(existing);
                    invoiceService.generateInvoice(existing);
                }

                return new PaymentResponse(
                        existing.getStripePaymentIntentId(),
                        existingIntent.getClientSecret(),
                        existing.getTransactionId(),
                        existing.getStatus(),
                        existing.getAmount(),
                        existing.getCurrency()
                );
            } catch (StripeException e) {
                log.error("Stripe error while resuming existing intent: {}", e.getMessage());
                throw new RuntimeException("Failed to retrieve existing payment intent: " + e.getMessage());
            }
        }

        try {
            String currency = (request.getCurrency() == null || request.getCurrency().isBlank())
                    ? "LKR"
                    : request.getCurrency().trim().toUpperCase();

            // Stripe expects amount in the smallest currency unit (e.g., cents).
            long amountInSmallestUnit = toSmallestCurrencyUnit(request.getAmount(), currency);

            // Build the PaymentIntent parameters
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInSmallestUnit)
                    .setCurrency(currency.toLowerCase())
                    .setDescription(request.getDescription())
                    .putMetadata("appointmentId", String.valueOf(request.getAppointmentId()))
                    .putMetadata("patientId", String.valueOf(request.getPatientId()))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build()
                    );

            // Check if this is auto-confirm (payment method provided)
            boolean isAutoConfirm = false;
            if (request.getPaymentMethodId() != null && !request.getPaymentMethodId().isEmpty()) {
                paramsBuilder.setPaymentMethod(request.getPaymentMethodId());
                paramsBuilder.setConfirm(true);
                isAutoConfirm = true;

                // ✅ Add return URL only when confirming immediately (Stripe requirement)
                if (request.getReturnUrl() != null && !request.getReturnUrl().isEmpty()) {
                    paramsBuilder.setReturnUrl(request.getReturnUrl());
                }

                log.info("Auto-confirm enabled for payment method: {}", request.getPaymentMethodId());
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            log.info("PaymentIntent created: {} with status: {}", paymentIntent.getId(), paymentIntent.getStatus());

            String transactionId = "TXN-" + System.currentTimeMillis() + "-" +
                    UUID.randomUUID().toString().substring(0, 8);

            // Create transaction with PENDING status first
            Transaction transaction = new Transaction(
                    transactionId,
                    paymentIntent.getId(),
                    request.getAppointmentId(),
                    request.getPatientId(),
                    request.getDoctorId(),
                    request.getAmount(),
                    currency,
                    Transaction.TransactionStatus.PENDING.name(),
                    request.getDescription()
            );

            // Set payment method if provided
            if (request.getPaymentMethodId() != null) {
                transaction.setPaymentMethod(request.getPaymentMethodId());
            }

            // Set additional details
            if (request.getPatientName() != null) transaction.setPatientName(request.getPatientName());
            if (request.getPatientEmail() != null) transaction.setPatientEmail(request.getPatientEmail());
            if (request.getPatientPhone() != null) transaction.setPatientPhone(request.getPatientPhone());
            if (request.getDoctorName() != null) transaction.setDoctorName(request.getDoctorName());
            if (request.getDoctorSpecialty() != null) transaction.setDoctorSpecialty(request.getDoctorSpecialty());
            if (request.getAppointmentDate() != null) transaction.setAppointmentDate(request.getAppointmentDate());
            if (request.getAppointmentTimeSlot() != null) transaction.setAppointmentTimeSlot(request.getAppointmentTimeSlot());

            transactionRepository.save(transaction);
            log.info("Transaction saved with ID: {} with PENDING status", transactionId);

            // ========== ALWAYS CALL CONFIRM FOR AUTO-CONFIRM ==========
            String finalStatus;
            String finalPaymentIntentId = paymentIntent.getId();
            String finalTransactionId = transactionId;

            if (isAutoConfirm) {
                log.info("Auto-confirm enabled. Calling confirm to update database status...");

                // Create confirmation DTO
                PaymentConfirmationDTO confirmation = new PaymentConfirmationDTO();
                confirmation.setPaymentIntentId(finalPaymentIntentId);
                confirmation.setTransactionId(finalTransactionId);
                confirmation.setAppointmentId(request.getAppointmentId());

                // Call confirmPayment to update the database
                TransactionDTO confirmedTransaction = confirmPayment(confirmation);
                finalStatus = confirmedTransaction.getStatus();
                log.info("Confirm completed. Final status: {}", finalStatus);
            } else {
                finalStatus = paymentIntent.getStatus();
            }
            // =========================================================

                return new PaymentResponse(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    transactionId,
                    finalStatus,
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
        
        // Check if this appointment already has a successful payment (double check)
        if (transaction.getStatus().equals(Transaction.TransactionStatus.SUCCEEDED.name())) {
            log.warn("Payment already succeeded for transaction: {}", transaction.getTransactionId());
            return mapToDTO(transaction);
        }
        
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
    
    /**
     * Check if an appointment has been paid successfully
     */
    public boolean isAppointmentPaid(Long appointmentId) {
        List<Transaction> transactions = transactionRepository.findByAppointmentId(appointmentId);
        return transactions.stream()
            .anyMatch(t -> t.getStatus().equals(Transaction.TransactionStatus.SUCCEEDED.name()));
    }
    
    /**
     * Get successful transaction for an appointment
     */
    public TransactionDTO getSuccessfulTransactionByAppointment(Long appointmentId) {
        List<Transaction> transactions = transactionRepository.findByAppointmentId(appointmentId);
        return transactions.stream()
            .filter(t -> t.getStatus().equals(Transaction.TransactionStatus.SUCCEEDED.name()))
            .findFirst()
            .map(this::mapToDTO)
            .orElse(null);
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

    /**
     * Convert an amount in major currency unit (e.g., 15.00 PKR) to the smallest unit expected by Stripe.
     * Most currencies use 2 fraction digits, some use 0 (e.g., JPY), and a few use 3.
     */
    private long toSmallestCurrencyUnit(java.math.BigDecimal amount, String currency) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount is required");
        }

        java.util.Currency cur = java.util.Currency.getInstance(currency);
        int fractionDigits = cur.getDefaultFractionDigits();

        java.math.BigDecimal scaled = amount
                .setScale(fractionDigits, java.math.RoundingMode.HALF_UP)
                .movePointRight(fractionDigits);

        try {
            return scaled.longValueExact();
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException("Amount is too large or has too many decimals for currency " + currency + ": " + amount);
        }
    }
}

