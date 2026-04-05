package com.healthcare.doctor_service.client;

import com.healthcare.doctor_service.dto.PatientPrescriptionUpsertRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "patient-service", fallback = PatientServiceClientFallback.class)
public interface PatientServiceClient {

    @PostMapping("/internal/prescriptions")
    void upsertPrescription(@RequestBody PatientPrescriptionUpsertRequest request);
}

