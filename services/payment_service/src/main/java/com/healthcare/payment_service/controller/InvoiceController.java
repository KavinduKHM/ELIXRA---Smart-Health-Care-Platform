package com.healthcare.payment_service.controller;

import com.healthcare.payment_service.dto.InvoiceDTO;
import com.healthcare.payment_service.service.InvoiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments/invoices")
public class InvoiceController {
    
    private static final Logger log = LoggerFactory.getLogger(InvoiceController.class);
    private final InvoiceService invoiceService;
    
    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }
    
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceDTO> getInvoice(@PathVariable Long invoiceId) {
        log.info("GET /api/payments/invoices/{}", invoiceId);
        InvoiceDTO invoice = invoiceService.getInvoice(invoiceId);
        return ResponseEntity.ok(invoice);
    }
    
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<List<InvoiceDTO>> getPatientInvoices(@PathVariable Long patientId) {
        log.info("GET /api/payments/invoices/patients/{}", patientId);
        List<InvoiceDTO> invoices = invoiceService.getPatientInvoices(patientId);
        return ResponseEntity.ok(invoices);
    }
}