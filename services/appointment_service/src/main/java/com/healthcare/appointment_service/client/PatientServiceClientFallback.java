package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.PatientDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback implementation for Patient Service Client.
 */
@Component
@Slf4j
public class PatientServiceClientFallback implements PatientServiceClient {

    @Override
    public PatientDTO getPatientById(Long id) {
        log.warn("Patient Service unavailable. Returning mock patient for ID: {}", id);

        // Return mock patient data for development
        PatientDTO mockPatient = new PatientDTO();
        mockPatient.setId(id);
        mockPatient.setFirstName("Mock");
        mockPatient.setLastName("Patient");
        mockPatient.setEmail("mock@patient.com");
        return mockPatient;
    }
}