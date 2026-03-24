package com.healthcare.telemedicine_service;

import com.healthcare.telemedicine_service.dto.*;
import com.healthcare.telemedicine_service.model.VideoSession;
import com.healthcare.telemedicine_service.repository.VideoSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core service for telemedicine operations.
 *
 * Handles:
 * - Creating video sessions for appointments
 * - Generating Agora tokens for joining sessions
 * - Managing session lifecycle (start, end, cancel)
 * - Tracking session status and duration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelemedicineService {

    private final VideoSessionRepository sessionRepository;
    private final AgoraTokenService agoraTokenService;

    /**
     * Creates a new video session for an appointment.
     */
    @Transactional
    public SessionDetailsDTO createSession(CreateSessionRequest request) {
        log.info("Creating video session for appointment: {}", request.getAppointmentId());

        // Check if session already exists
        if (sessionRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new RuntimeException("Session already exists for appointment: " +
                    request.getAppointmentId());
        }

        // Generate unique channel name
        String channelName = "appointment_" + request.getAppointmentId();

        // Create new session
        VideoSession session = VideoSession.builder()
                .channelName(channelName)
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .status(VideoSession.SessionStatus.SCHEDULED)
                .scheduledStartTime(request.getScheduledStartTime())
                .build();

        VideoSession savedSession = sessionRepository.save(session);
        log.info("Video session created with ID: {}", savedSession.getId());

        return SessionDetailsDTO.fromEntity(savedSession);
    }

    /**
     * Joins a video session and generates Agora token.
     */
    @Transactional
    public JoinSessionResponse joinSession(JoinSessionRequest request) {
        log.info("User {} (role: {}) joining session: {}",
                request.getUserId(), request.getUserRole(), request.getSessionId());

        VideoSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + request.getSessionId()));

        // Verify authorization
        boolean isAuthorized = false;
        if ("PATIENT".equalsIgnoreCase(request.getUserRole())) {
            isAuthorized = session.getPatientId().equals(request.getUserId());
        } else if ("DOCTOR".equalsIgnoreCase(request.getUserRole())) {
            isAuthorized = session.getDoctorId().equals(request.getUserId());
        }

        if (!isAuthorized) {
            throw new RuntimeException("User not authorized to join this session");
        }

        // Check session status
        if (session.getStatus() == VideoSession.SessionStatus.ENDED) {
            throw new RuntimeException("Session has already ended");
        }
        if (session.getStatus() == VideoSession.SessionStatus.CANCELLED) {
            throw new RuntimeException("Session has been cancelled");
        }
        if (session.getStatus() == VideoSession.SessionStatus.MISSED) {
            throw new RuntimeException("Session was missed");
        }

        // Generate Agora token
        String token = agoraTokenService.generateToken(session.getChannelName(), request.getUserId());

        // Store token in session
        if ("PATIENT".equalsIgnoreCase(request.getUserRole())) {
            session.setPatientToken(token);
        } else {
            session.setDoctorToken(token);
        }

        // Mark session as ACTIVE if first user joins
        if (session.getStatus() == VideoSession.SessionStatus.SCHEDULED) {
            session.setStatus(VideoSession.SessionStatus.ACTIVE);
            session.setActualStartTime(LocalDateTime.now());
            log.info("Session {} became ACTIVE", session.getId());
        }

        sessionRepository.save(session);

        return JoinSessionResponse.builder()
                .sessionId(session.getId())
                .channelName(session.getChannelName())
                .token(token)
                .appId(agoraTokenService.getAppId())
                .userId(request.getUserId())
                .userRole(request.getUserRole())
                .appointmentId(session.getAppointmentId())
                .sessionActive(session.getStatus() == VideoSession.SessionStatus.ACTIVE)
                .build();
    }

    /**
     * Ends a video session.
     */
    @Transactional
    public SessionDetailsDTO endSession(EndSessionRequest request) {
        log.info("Ending session: {}", request.getSessionId());

        VideoSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + request.getSessionId()));

        // Verify authorization
        boolean isAuthorized = session.getPatientId().equals(request.getUserId()) ||
                session.getDoctorId().equals(request.getUserId());

        if (!isAuthorized) {
            throw new RuntimeException("User not authorized to end this session");
        }

        if (session.getStatus() != VideoSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not active, cannot end");
        }

        // Calculate duration
        LocalDateTime now = LocalDateTime.now();
        long durationSeconds = ChronoUnit.SECONDS.between(session.getActualStartTime(), now);

        // Update session
        session.setStatus(VideoSession.SessionStatus.ENDED);
        session.setActualEndTime(now);
        session.setDurationSeconds(durationSeconds);

        if (request.getConsultationNotes() != null) {
            session.setConsultationNotes(request.getConsultationNotes());
        }

        sessionRepository.save(session);

        log.info("Session {} ended. Duration: {} seconds", session.getId(), durationSeconds);

        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Cancels a scheduled session.
     */
    @Transactional
    public SessionDetailsDTO cancelSession(Long sessionId, Long userId) {
        log.info("Cancelling session: {} by user: {}", sessionId, userId);

        VideoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        boolean isAuthorized = session.getPatientId().equals(userId) ||
                session.getDoctorId().equals(userId);

        if (!isAuthorized) {
            throw new RuntimeException("User not authorized to cancel this session");
        }

        if (session.getStatus() != VideoSession.SessionStatus.SCHEDULED) {
            throw new RuntimeException("Cannot cancel session in status: " + session.getStatus());
        }

        session.setStatus(VideoSession.SessionStatus.CANCELLED);
        sessionRepository.save(session);

        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Gets session details.
     */
    public SessionDetailsDTO getSessionDetails(Long sessionId) {
        VideoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Gets sessions by appointment.
     */
    public List<SessionDetailsDTO> getSessionsByAppointment(Long appointmentId) {
        return sessionRepository.findByAppointmentId(appointmentId)
                .map(List::of)
                .orElse(List.of())
                .stream()
                .map(SessionDetailsDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets active sessions for patient.
     */
    public List<SessionDetailsDTO> getActiveSessionsForPatient(Long patientId) {
        return sessionRepository.findByPatientIdAndStatus(patientId, VideoSession.SessionStatus.ACTIVE)
                .stream()
                .map(SessionDetailsDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets active sessions for doctor.
     */
    public List<SessionDetailsDTO> getActiveSessionsForDoctor(Long doctorId) {
        return sessionRepository.findByDoctorIdAndStatus(doctorId, VideoSession.SessionStatus.ACTIVE)
                .stream()
                .map(SessionDetailsDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Checks if user can join session.
     */
    public boolean canJoinSession(Long sessionId, Long userId, String userRole) {
        return sessionRepository.findById(sessionId)
                .map(session -> {
                    if ("PATIENT".equalsIgnoreCase(userRole)) {
                        return session.getPatientId().equals(userId);
                    } else if ("DOCTOR".equalsIgnoreCase(userRole)) {
                        return session.getDoctorId().equals(userId);
                    }
                    return false;
                })
                .orElse(false);
    }

    /**
     * Processes missed sessions.
     */
    @Transactional
    public void processMissedSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<VideoSession> missedSessions = sessionRepository.findMissedSessions(
                VideoSession.SessionStatus.SCHEDULED, now);

        for (VideoSession session : missedSessions) {
            log.warn("Marking session {} as MISSED (scheduled for: {})",
                    session.getId(), session.getScheduledStartTime());
            session.setStatus(VideoSession.SessionStatus.MISSED);
            sessionRepository.save(session);
        }
    }
}