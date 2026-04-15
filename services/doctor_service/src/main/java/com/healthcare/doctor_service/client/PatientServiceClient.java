package com.healthcare.doctor_service.client;

import com.healthcare.doctor_service.dto.PatientPrescriptionUpsertRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client to patient-service internal sync endpoint.
 */
@FeignClient(name = "patient-service")
public interface PatientServiceClient {

    @PostMapping(value = "/api/patients/_internal/prescriptions", consumes = MediaType.APPLICATION_JSON_VALUE)
    void upsertPrescription(@RequestBody PatientPrescriptionUpsertRequest request);
}
