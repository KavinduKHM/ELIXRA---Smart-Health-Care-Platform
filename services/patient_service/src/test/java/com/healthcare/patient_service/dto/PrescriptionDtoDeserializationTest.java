package com.healthcare.patient_service.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PrescriptionDtoDeserializationTest {

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Test
    void canDeserializeDoctorServicePrescriptionList() throws Exception {
        // Matches what doctor-service returns from GET /api/doctors/prescriptions/patient/{patientId}
        String json = "[" +
                "{\"id\":1," +
                "\"doctorId\":1," +
                "\"doctorName\":\"Dr. Alice\"," +
                "\"patientId\":1," +
                "\"appointmentId\":1," +
                "\"diagnosis\":\"Leg pain\"," +
                "\"notes\":\"\"," +
                "\"medicines\":[{" +
                "\"medicineName\":\"Amoxicillin\"," +
                "\"dosage\":\"10mg\"," +
                "\"frequency\":\"Once daily\"" +
                "}]," +
                "\"validUntil\":\"2026-05-10T00:00:00\"," +
                "\"issuedAt\":\"2026-04-05T10:00:00\"," +
                "\"status\":\"ACTIVE\"" +
                "}]";

        List<PrescriptionDTO> list = mapper.readValue(json, new TypeReference<List<PrescriptionDTO>>() {});

        assertEquals(1, list.size());
        PrescriptionDTO dto = list.get(0);
        assertEquals(1L, dto.getPatientId());
        assertEquals(1L, dto.getDoctorId());
        assertEquals(1L, dto.getAppointmentId());
        assertNotNull(dto.getPrescriptionDate());
        assertNotNull(dto.getValidUntil());
        assertNotNull(dto.getMedications());
        assertEquals(1, dto.getMedications().size());
        assertEquals("Amoxicillin", dto.getMedications().get(0).getMedicationName());
    }
}

