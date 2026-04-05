package com.healthcare.patient_service.controller;

import com.healthcare.patient_service.dto.PrescriptionUpsertRequest;
import com.healthcare.patient_service.service.PrescriptionIngestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal endpoint used by doctor-service to write prescriptions into patient DB.
 */
@RestController
@RequestMapping("/internal/prescriptions")
@RequiredArgsConstructor
public class PrescriptionIngestionController {

    private final PrescriptionIngestionService ingestionService;

    @PostMapping
    public ResponseEntity<Void> upsert(@Valid @RequestBody PrescriptionUpsertRequest request) {
        ingestionService.upsertPrescription(request);
        return ResponseEntity.ok().build();
    }
}

