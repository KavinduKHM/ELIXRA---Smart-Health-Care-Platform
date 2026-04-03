package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

@Data
public class EndSessionRequest {
    private Long sessionId;
    private Long userId;
    private String consultationNotes;
}

