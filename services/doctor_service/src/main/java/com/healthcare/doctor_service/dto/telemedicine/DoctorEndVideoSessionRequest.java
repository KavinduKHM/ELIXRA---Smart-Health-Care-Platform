package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

@Data
public class DoctorEndVideoSessionRequest {
    private Long sessionId;
    private Long doctorId; // maps to userId in telemedicine end request
    private String consultationNotes;
}

