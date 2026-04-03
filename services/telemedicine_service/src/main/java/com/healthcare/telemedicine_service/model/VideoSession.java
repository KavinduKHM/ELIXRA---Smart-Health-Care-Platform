package com.healthcare.telemedicine_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * VideoSession Entity - Represents a video consultation session.
 * 
 * This entity stores information about each video call between a patient and doctor.
 * Each session has a unique channel name that Agora uses to connect participants.
 */
@Entity
@Table(name = "video_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Unique channel name for the video session.
     * This is used by Agora to identify the room where participants connect.
     * Format: "appointment_{appointmentId}"
     */
    @Column(unique = true, nullable = false)
    private String channelName;
    
    /**
     * ID of the appointment this video session belongs to.
     * Links to the Appointment Service.
     */
    @Column(nullable = false)
    private Long appointmentId;
    
    /**
     * ID of the patient participating in the session.
     * Links to the Patient Service.
     */
    @Column(nullable = false)
    private Long patientId;
    
    /**
     * ID of the doctor participating in the session.
     * Links to the Doctor Service.
     */
    @Column(nullable = false)
    private Long doctorId;
    
    /**
     * Current status of the video session.
     * - SCHEDULED: Session created but not started
     * - ACTIVE: Session is ongoing
     * - ENDED: Session completed
     * - MISSED: Session not attended
     * - CANCELLED: Session cancelled
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;
    
    /**
     * Agora token for the patient (generated server-side).
     * Patient uses this to join the video session.
     */
    @Column(length = 1000)
    private String patientToken;
    
    /**
     * Agora token for the doctor (generated server-side).
     * Doctor uses this to join the video session.
     */
    @Column(length = 1000)
    private String doctorToken;
    
    /**
     * Timestamp when the session was scheduled to start.
     */
    private LocalDateTime scheduledStartTime;
    
    /**
     * Actual timestamp when the session started.
     */
    private LocalDateTime actualStartTime;
    
    /**
     * Timestamp when the session ended.
     */
    private LocalDateTime actualEndTime;
    
    /**
     * Duration of the session in seconds (calculated after session ends).
     */
    private Long durationSeconds;
    
    /**
     * Notes about the consultation (e.g., summary, follow-up instructions).
     */
    @Column(length = 2000)
    private String consultationNotes;
    
    /**
     * Timestamp when this record was created.
     */
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when this record was last updated.
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * Enum for session status values.
     */
    public enum SessionStatus {
        SCHEDULED,   // Session is created and waiting to start
        ACTIVE,      // Session is currently in progress
        ENDED,       // Session completed successfully
        MISSED,      // Session was missed (no one joined)
        CANCELLED    // Session was cancelled by patient or doctor
    }
}