package com.healthcare.telemedicine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * SessionRecording Entity - Stores information about recorded video sessions.
 *
 * This is an optional feature for storing recordings of consultations.
 * Note: Recording requires additional Agora Cloud Recording service.
 */
@Entity
@Table(name = "session_recordings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionRecording {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Reference to the video session this recording belongs to.
     */
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private VideoSession videoSession;

    /**
     * URL where the recording is stored (e.g., S3 bucket, cloud storage).
     */
    @Column(nullable = false)
    private String recordingUrl;

    /**
     * Duration of the recording in seconds.
     */
    private Long durationSeconds;

    /**
     * Size of the recording file in bytes.
     */
    private Long fileSizeBytes;

    /**
     * Status of the recording.
     * - PENDING: Recording being processed
     * - AVAILABLE: Recording ready for viewing
     * - FAILED: Recording failed
     */
    @Enumerated(EnumType.STRING)
    private RecordingStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum RecordingStatus {
        PENDING, AVAILABLE, FAILED
    }
}