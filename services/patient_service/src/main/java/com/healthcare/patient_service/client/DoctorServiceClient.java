package com.healthcare.patient_service.client;

import com.healthcare.patient_service.dto.PrescriptionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "doctor-service", fallback = DoctorServiceClientFallback.class)
public interface DoctorServiceClient {

    @GetMapping("/api/doctors/prescriptions/patient/{patientId}")
    List<PrescriptionDTO> getPatientPrescriptions(@PathVariable("patientId") Long patientId);
}