package com.healthcare.doctor_service.client;

import com.healthcare.doctor_service.dto.PatientPrescriptionUpsertRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PatientServiceClientFallback implements PatientServiceClient {

    @Override
    public void upsertPrescription(PatientPrescriptionUpsertRequest request) {
        // Non-fatal fallback: prescription is still persisted in doctor DB.
        log.warn("patient-service unavailable, skipping prescription sync for appointmentId={} patientId={}",
                request.getAppointmentId(), request.getPatientId());
    }
}

