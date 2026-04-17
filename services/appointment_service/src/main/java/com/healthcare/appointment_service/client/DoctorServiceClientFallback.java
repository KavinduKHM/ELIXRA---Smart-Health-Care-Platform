package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.DoctorDTO;
import com.healthcare.appointment_service.dto.DoctorAvailabilityDTO;
import com.healthcare.appointment_service.dto.DoctorSearchResponse;
import com.healthcare.appointment_service.dto.TimeSlotDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Fallback implementation for Doctor Service Client.
 * Called when doctor-service is unavailable.
 */
@Component
@Slf4j
public class DoctorServiceClientFallback implements DoctorServiceClient {

    @Override
    public DoctorDTO getDoctorById(Long id) {
        log.warn("Doctor Service unavailable. Returning mock doctor for ID: {}", id);

        // Return mock doctor data for development
        DoctorDTO mockDoctor = new DoctorDTO();
        mockDoctor.setId(id);
        mockDoctor.setFirstName("Mock");
        mockDoctor.setLastName("Doctor");
        mockDoctor.setSpecialty("General Medicine");
        mockDoctor.setEmail("mock@doctor.com");
        mockDoctor.setConsultationFee(2500.0);
        mockDoctor.setAvailable(true);
        return mockDoctor;
    }

    @Override
    public List<DoctorDTO> getVerifiedDoctors() {
        log.warn("Doctor Service unavailable. Returning empty verified doctors list");
        return new ArrayList<>();
    }

    @Override
    public List<DoctorDTO> getDoctorsBySpecialty(String specialty) {
        log.warn("Doctor Service unavailable. Returning empty specialty search results");
        return new ArrayList<>();
    }

    @Override
    public List<DoctorAvailabilityDTO> getAvailabilitySlots(Long doctorId, String date) {
        log.warn("Doctor Service unavailable. Returning empty available slots");
        return new ArrayList<>();
    }

    @Override
    public boolean checkAvailability(Long doctorId, String time) {
        log.warn("Doctor Service unavailable. Assuming doctor is available");
        return true;  // Assume available for development
    }

    @Override
    public void bookTimeSlot(Long doctorId, String time) {
        log.warn("Doctor Service unavailable. Skipping slot booking");
        // Do nothing in fallback
    }
}