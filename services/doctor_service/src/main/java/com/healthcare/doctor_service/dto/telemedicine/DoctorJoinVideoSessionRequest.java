package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

@Data
public class DoctorJoinVideoSessionRequest {
    private Long sessionId;
    private Long doctorId; // maps to userId in telemedicine join request
}

