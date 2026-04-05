package com.healthcare.payment_service.service;

import com.healthcare.payment_service.dto.InvoiceDTO;
import com.healthcare.payment_service.model.Invoice;
import com.healthcare.payment_service.model.Transaction;
import com.healthcare.payment_service.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {
    
    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);
    private final InvoiceRepository invoiceRepository;
    
    private static final BigDecimal VAT_RATE = new BigDecimal("0.00");
    private static final BigDecimal SERVICE_CHARGE_RATE = new BigDecimal("0.00");
    
    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    
    @Transactional
    public InvoiceDTO generateInvoice(Transaction transaction) {
        log.info("Generating invoice for transaction: {}", transaction.getTransactionId());
        
        if (invoiceRepository.findByTransactionId(transaction.getId()).isPresent()) {
            log.warn("Invoice already exists for transaction: {}", transaction.getTransactionId());
            return null;
        }
        
        BigDecimal taxAmount = transaction.getAmount()
            .multiply(VAT_RATE)
            .add(transaction.getAmount().multiply(SERVICE_CHARGE_RATE));
        
        BigDecimal totalAmount = transaction.getAmount().add(taxAmount);
        String invoiceNumber = generateInvoiceNumber();
        
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setTransactionId(transaction.getId());
        invoice.setPatientId(transaction.getPatientId());
        invoice.setPatientName("Patient Name");
        invoice.setPatientEmail("patient@email.com");
        invoice.setDoctorId(transaction.getDoctorId());
        invoice.setDoctorName("Doctor Name");
        invoice.setAmount(transaction.getAmount());
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setCurrency(transaction.getCurrency());
        invoice.setDescription(transaction.getDescription());
        invoice.setStatus(Invoice.InvoiceStatus.GENERATED.name());
        invoice.setCreatedAt(LocalDateTime.now());
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice generated: {}", invoiceNumber);
        
        return mapToDTO(savedInvoice);
    }
    
    public InvoiceDTO getInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        return mapToDTO(invoice);
    }
    
    public List<InvoiceDTO> getPatientInvoices(Long patientId) {
        return invoiceRepository.findByPatientId(patientId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private String generateInvoiceNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count() + 1;
        return String.format("INV-%s-%04d", datePrefix, count);
    }
    
    private InvoiceDTO mapToDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setTransactionId(invoice.getTransactionId());
        dto.setPatientId(invoice.getPatientId());
        dto.setPatientName(invoice.getPatientName());
        dto.setPatientEmail(invoice.getPatientEmail());
        dto.setDoctorId(invoice.getDoctorId());
        dto.setDoctorName(invoice.getDoctorName());
        dto.setAmount(invoice.getAmount());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setCurrency(invoice.getCurrency());
        dto.setDescription(invoice.getDescription());
        dto.setInvoiceUrl(invoice.getInvoiceUrl());
        dto.setStatus(invoice.getStatus());
        dto.setCreatedAt(invoice.getCreatedAt());
        return dto;
    }
}