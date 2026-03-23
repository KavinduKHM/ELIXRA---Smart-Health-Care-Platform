package com.healthcare.telemedicine.dto;

import com.healthcare.telemedicine.model.VideoSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for session details.
 * Used to retrieve information about a specific video session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionDetailsDTO {

    private Long id;
    private String channelName;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private VideoSession.SessionStatus status;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long durationSeconds;
    private String consultationNotes;
    private LocalDateTime createdAt;

    /**
     * Factory method to create DTO from entity.
     */
    public static SessionDetailsDTO fromEntity(VideoSession session) {
        return SessionDetailsDTO.builder()
                .id(session.getId())
                .channelName(session.getChannelName())
                .appointmentId(session.getAppointmentId())
                .patientId(session.getPatientId())
                .doctorId(session.getDoctorId())
                .status(session.getStatus())
                .scheduledStartTime(session.getScheduledStartTime())
                .actualStartTime(session.getActualStartTime())
                .actualEndTime(session.getActualEndTime())
                .durationSeconds(session.getDurationSeconds())
                .consultationNotes(session.getConsultationNotes())
                .createdAt(session.getCreatedAt())
                .build();
    }
}