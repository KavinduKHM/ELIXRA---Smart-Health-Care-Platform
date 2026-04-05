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
    
    private static final BigDecimal VAT_RATE = new BigDecimal("0.08");  // 8% VAT for Sri Lanka
    private static final BigDecimal SERVICE_CHARGE_RATE = new BigDecimal("0.02"); // 2% service charge
    
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
        
        // Calculate tax amounts
        BigDecimal taxAmount = transaction.getAmount()
            .multiply(VAT_RATE)
            .add(transaction.getAmount().multiply(SERVICE_CHARGE_RATE));
        
        BigDecimal totalAmount = transaction.getAmount().add(taxAmount);
        String invoiceNumber = generateInvoiceNumber();
        
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setTransactionId(transaction.getId());
        
        // Appointment details
        invoice.setAppointmentId(transaction.getAppointmentId());
        invoice.setAppointmentDate(transaction.getAppointmentDate());
        invoice.setAppointmentTimeSlot(transaction.getAppointmentTimeSlot());
        
        // Patient details
        invoice.setPatientId(transaction.getPatientId());
        invoice.setPatientName(transaction.getPatientName() != null ? transaction.getPatientName() : "Patient");
        invoice.setPatientEmail(transaction.getPatientEmail() != null ? transaction.getPatientEmail() : "N/A");
        invoice.setPatientPhone(transaction.getPatientPhone());
        
        // Doctor details
        invoice.setDoctorId(transaction.getDoctorId());
        invoice.setDoctorName(transaction.getDoctorName() != null ? transaction.getDoctorName() : "Doctor");
        invoice.setDoctorSpecialty(transaction.getDoctorSpecialty());
        
        // Payment details
        invoice.setPaymentMethod(transaction.getPaymentMethod());
        invoice.setCardLast4(transaction.getCardLast4());
        invoice.setCardBrand(transaction.getCardBrand());
        invoice.setTransactionReference(transaction.getStripePaymentIntentId());
        
        // Amounts
        invoice.setAmount(transaction.getAmount());
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setCurrency(transaction.getCurrency());
        invoice.setDescription(transaction.getDescription());
        
        invoice.setStatus(Invoice.InvoiceStatus.GENERATED.name());
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setPaidAt(transaction.getPaidAt());
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice generated: {} for transaction: {}", invoiceNumber, transaction.getTransactionId());
        
        return mapToDTO(savedInvoice);
    }
    
    public InvoiceDTO getInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        return mapToDTO(invoice);
    }
    
    public InvoiceDTO getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceNumber));
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
        dto.setAppointmentId(invoice.getAppointmentId());
        dto.setAppointmentDate(invoice.getAppointmentDate());
        dto.setAppointmentTimeSlot(invoice.getAppointmentTimeSlot());
        dto.setPatientId(invoice.getPatientId());
        dto.setPatientName(invoice.getPatientName());
        dto.setPatientEmail(invoice.getPatientEmail());
        dto.setPatientPhone(invoice.getPatientPhone());
        dto.setDoctorId(invoice.getDoctorId());
        dto.setDoctorName(invoice.getDoctorName());
        dto.setDoctorSpecialty(invoice.getDoctorSpecialty());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        dto.setCardLast4(invoice.getCardLast4());
        dto.setCardBrand(invoice.getCardBrand());
        dto.setTransactionReference(invoice.getTransactionReference());
        dto.setAmount(invoice.getAmount());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setCurrency(invoice.getCurrency());
        dto.setDescription(invoice.getDescription());
        dto.setInvoiceUrl(invoice.getInvoiceUrl());
        dto.setStatus(invoice.getStatus());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setPaidAt(invoice.getPaidAt());
        return dto;
    }
}