package com.healthcare.doctor_service.dto.telemedicine;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionDetailsDTO {
    private Long id;
    private String channelName;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String status;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long durationSeconds;
    private String consultationNotes;
    private LocalDateTime createdAt;
}

