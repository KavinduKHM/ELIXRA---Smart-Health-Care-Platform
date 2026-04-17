package com.healthcare.telemedicine_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSessionEvent {

    /** e.g. SESSION_STARTED */
    private String type;

    private Long sessionId;
    private Long appointmentId;
    private String channelName;
    private Long doctorId;
    private Instant timestamp;
}
