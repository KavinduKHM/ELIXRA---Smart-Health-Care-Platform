package com.healthcare.payment_service.repository;

import com.healthcare.payment_service.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    Optional<Invoice> findByTransactionId(Long transactionId);
    List<Invoice> findByPatientId(Long patientId);
}