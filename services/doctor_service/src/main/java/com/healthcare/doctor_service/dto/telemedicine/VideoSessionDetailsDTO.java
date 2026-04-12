package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Minimal response DTO mirroring telemedicine-service SessionDetailsDTO.
 * We keep it loose to avoid tight coupling.
 */
@Data
public class VideoSessionDetailsDTO {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;

    private String channelName;
    private String patientToken;
    private String doctorToken;

    private String status;

    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    private Long durationSeconds;
}

