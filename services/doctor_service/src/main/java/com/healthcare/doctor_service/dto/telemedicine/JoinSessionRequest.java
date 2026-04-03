package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

@Data
public class JoinSessionRequest {
    private Long sessionId;
    private Long userId;
    private String userRole; // "DOCTOR" is expected when called from doctor-service
}

