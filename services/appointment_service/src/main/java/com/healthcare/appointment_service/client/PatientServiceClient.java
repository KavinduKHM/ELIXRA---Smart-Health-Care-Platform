package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.PatientDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for calling Patient Service.
 */
@FeignClient(name = "patient-service", url = "http://patient-service:8082", fallback = PatientServiceClientFallback.class)
public interface PatientServiceClient {

    /**
     * Get patient by ID
     */
    @GetMapping("/api/patients/{id}")
    PatientDTO getPatientById(@PathVariable("id") Long id);
}