package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

@Data
public class JoinSessionResponse {
    private Long sessionId;
    private String channelName;
    private String token;
    private String appId;
    private Long userId;
    private String userRole;
    private Long appointmentId;
    private boolean sessionActive;
}

