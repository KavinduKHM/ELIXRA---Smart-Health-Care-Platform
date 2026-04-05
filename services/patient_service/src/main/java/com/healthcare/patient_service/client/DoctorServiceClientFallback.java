package com.healthcare.patient_service.client;

import com.healthcare.patient_service.dto.PrescriptionDTO;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class DoctorServiceClientFallback implements DoctorServiceClient {
    @Override
    public List<PrescriptionDTO> getPatientPrescriptions(Long patientId) {
        return Collections.emptyList();
    }
}