package com.healthcare.payment_service.repository;

import com.healthcare.payment_service.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionId(String transactionId);
    Optional<Transaction> findByStripePaymentIntentId(String stripePaymentIntentId);
    List<Transaction> findByPatientId(Long patientId);
    List<Transaction> findByStatus(String status);
    boolean existsByAppointmentId(Long appointmentId);
}