package com.healthcare.telemedicine.repository;

import com.healthcare.telemedicine.model.VideoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for VideoSession entity.
 * Provides CRUD operations and custom queries for video sessions.
 */
@Repository
public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {

    /**
     * Find video session by appointment ID.
     * Used to check if a session already exists for an appointment.
     */
    Optional<VideoSession> findByAppointmentId(Long appointmentId);

    /**
     * Find session by channel name.
     * Used when validating token generation.
     */
    Optional<VideoSession> findByChannelName(String channelName);

    /**
     * Find all active sessions for a specific patient.
     * Used to prevent multiple active sessions for same patient.
     */
    List<VideoSession> findByPatientIdAndStatus(
            Long patientId,
            VideoSession.SessionStatus status
    );

    /**
     * Find all active sessions for a specific doctor.
     * Used to prevent multiple active sessions for same doctor.
     */
    List<VideoSession> findByDoctorIdAndStatus(
            Long doctorId,
            VideoSession.SessionStatus status
    );

    /**
     * Find all scheduled sessions for a doctor within a time range.
     * Used for doctor's calendar view.
     */
    List<VideoSession> findByDoctorIdAndStatusAndScheduledStartTimeBetween(
            Long doctorId,
            VideoSession.SessionStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    /**
     * Find all sessions that are scheduled to start but haven't been activated.
     * Used by scheduled job to check for missed sessions.
     */
    @Query("SELECT v FROM VideoSession v WHERE v.status = :status AND v.scheduledStartTime < :currentTime")
    List<VideoSession> findMissedSessions(
            @Param("status") VideoSession.SessionStatus status,
            @Param("currentTime") LocalDateTime currentTime
    );

    /**
     * Update session status and actual start time when session begins.
     */
    @Modifying
    @Query("UPDATE VideoSession v SET v.status = :status, v.actualStartTime = :startTime WHERE v.id = :sessionId")
    int markSessionActive(
            @Param("sessionId") Long sessionId,
            @Param("status") VideoSession.SessionStatus status,
            @Param("startTime") LocalDateTime startTime
    );

    /**
     * Update session status and end time when session ends.
     */
    @Modifying
    @Query("UPDATE VideoSession v SET v.status = :status, v.actualEndTime = :endTime, " +
            "v.durationSeconds = :duration WHERE v.id = :sessionId")
    int markSessionEnded(
            @Param("sessionId") Long sessionId,
            @Param("status") VideoSession.SessionStatus status,
            @Param("endTime") LocalDateTime endTime,
            @Param("duration") Long duration
    );
}