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
     * Get patient profile by ID
     *
     * NOTE: patient-service exposes the profile at /api/patients/{patientId}/profile
     */
    @GetMapping("/api/patients/{id}/profile")
    PatientDTO getPatientById(@PathVariable("id") Long id);
}