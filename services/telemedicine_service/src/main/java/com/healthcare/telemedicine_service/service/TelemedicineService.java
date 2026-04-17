package com.healthcare.telemedicine_service.service;

import com.healthcare.telemedicine_service.dto.*;
import com.healthcare.telemedicine_service.model.VideoSession;
import com.healthcare.telemedicine_service.repository.VideoSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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
    private final SimpMessagingTemplate messagingTemplate;

    // Constants for Agora user roles
    private static final int AGORA_ROLE_PUBLISHER = 1;  // Can send audio/video
    private static final int AGORA_ROLE_SUBSCRIBER = 2;  // Can only receive

    /**
     * Creates a new video session for an appointment.
     * Called by the Appointment Service when a new appointment is confirmed.
     *
     * @param request Session creation request
     * @return Created session details
     */
    @Transactional
    public SessionDetailsDTO createSession(CreateSessionRequest request) {
        log.info("Creating video session for appointment: {}", request.getAppointmentId());

        // Check if session already exists for this appointment
        if (sessionRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new RuntimeException("Session already exists for appointment: " +
                    request.getAppointmentId());
        }

        // Generate unique channel name for this session
        String channelName = "appointment_" + request.getAppointmentId();

        // Create new session entity
        VideoSession session = VideoSession.builder()
                .channelName(channelName)
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .status(VideoSession.SessionStatus.SCHEDULED)
                .scheduledStartTime(request.getScheduledStartTime())
                .build();

        // Save to database
        VideoSession savedSession = sessionRepository.save(session);
        log.info("Video session created with ID: {}", savedSession.getId());

        return SessionDetailsDTO.fromEntity(savedSession);
    }

    /**
     * Joins a video session.
     * Generates an Agora token for the user to authenticate with the video service.
     *
     * @param request Join session request
     * @return Response containing Agora connection details
     */
    @Transactional
    public JoinSessionResponse joinSession(JoinSessionRequest request) {
        log.info("User {} (role: {}) joining session: {}",
                request.getUserId(), request.getUserRole(), request.getSessionId());

        // Find the session
        VideoSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + request.getSessionId()));

        // Verify user is authorized to join this session
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

        // Gate patient join until the doctor actually starts the session.
        if ("PATIENT".equalsIgnoreCase(request.getUserRole())
                && session.getStatus() == VideoSession.SessionStatus.SCHEDULED) {
            throw new RuntimeException("Session has not started yet");
        }

        // Generate Agora token for the user
        String token = agoraTokenService.generatePublisherToken(
                session.getChannelName(),
                request.getUserId()
        );

        // Store token in session (optional - for tracking)
        if ("PATIENT".equalsIgnoreCase(request.getUserRole())) {
            session.setPatientToken(token);
        } else {
            session.setDoctorToken(token);
        }

        // Doctor join transitions session from SCHEDULED -> ACTIVE
        boolean startedNow = false;
        if ("DOCTOR".equalsIgnoreCase(request.getUserRole())
                && session.getStatus() == VideoSession.SessionStatus.SCHEDULED) {
            session.setStatus(VideoSession.SessionStatus.ACTIVE);
            session.setActualStartTime(LocalDateTime.now());
            startedNow = true;
            log.info("Session {} became ACTIVE (started by doctor)", session.getId());
        }

        sessionRepository.save(session);

        if (startedNow) {
            try {
                VideoSessionEvent event = VideoSessionEvent.builder()
                        .type("SESSION_STARTED")
                        .sessionId(session.getId())
                        .appointmentId(session.getAppointmentId())
                        .channelName(session.getChannelName())
                        .doctorId(session.getDoctorId())
                        .timestamp(Instant.now())
                        .build();

                messagingTemplate.convertAndSend(
                        "/topic/video.session." + session.getChannelName(),
                        event
                );
            } catch (Exception ex) {
                log.warn("Failed to broadcast SESSION_STARTED event for session {}", session.getId(), ex);
            }
        }

        // Build response for client
        return JoinSessionResponse.builder()
                .sessionId(session.getId())
                .channelName(session.getChannelName())
                .token(token)
                .appId(agoraTokenService.getAppId())  // Need to add getter in AgoraTokenService
                .userId(request.getUserId())
                .userRole(request.getUserRole())
                .appointmentId(session.getAppointmentId())
                .sessionActive(session.getStatus() == VideoSession.SessionStatus.ACTIVE)
                .build();
    }

    /**
     * Ends a video session.
     * Calculates duration and updates session status.
     *
     * @param request End session request
     * @return Updated session details
     */
    @Transactional
    public SessionDetailsDTO endSession(EndSessionRequest request) {
        log.info("Ending session: {}", request.getSessionId());

        // Find the session
        VideoSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found: " + request.getSessionId()));

        // Verify user is authorized to end this session
        boolean isAuthorized = session.getPatientId().equals(request.getUserId()) ||
                session.getDoctorId().equals(request.getUserId());

        if (!isAuthorized) {
            throw new RuntimeException("User not authorized to end this session");
        }

        // Only active sessions can be ended
        if (session.getStatus() != VideoSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not active, cannot end");
        }

        // Calculate session duration
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = session.getActualStartTime();
        long durationSeconds = ChronoUnit.SECONDS.between(startTime, now);

        // Update session
        session.setStatus(VideoSession.SessionStatus.ENDED);
        session.setActualEndTime(now);
        session.setDurationSeconds(durationSeconds);

        // Add consultation notes if provided
        if (request.getConsultationNotes() != null) {
            session.setConsultationNotes(request.getConsultationNotes());
        }

        sessionRepository.save(session);

        log.info("Session {} ended. Duration: {} seconds",
                session.getId(), durationSeconds);

        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Cancels a scheduled video session.
     *
     * @param sessionId ID of the session to cancel
     * @param userId User requesting cancellation (must be patient or doctor)
     * @return Updated session details
     */
    @Transactional
    public SessionDetailsDTO cancelSession(Long sessionId, Long userId) {
        log.info("Cancelling session: {} by user: {}", sessionId, userId);

        // Find the session
        VideoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        // Verify user is authorized to cancel
        boolean isAuthorized = session.getPatientId().equals(userId) ||
                session.getDoctorId().equals(userId);

        if (!isAuthorized) {
            throw new RuntimeException("User not authorized to cancel this session");
        }

        // Only scheduled sessions can be cancelled
        if (session.getStatus() != VideoSession.SessionStatus.SCHEDULED) {
            throw new RuntimeException("Cannot cancel session in status: " +
                    session.getStatus());
        }

        // Update session status
        session.setStatus(VideoSession.SessionStatus.CANCELLED);
        sessionRepository.save(session);

        log.info("Session {} cancelled", sessionId);

        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Gets details of a video session.
     *
     * @param sessionId ID of the session
     * @return Session details
     */
    public SessionDetailsDTO getSessionDetails(Long sessionId) {
        VideoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));

        return SessionDetailsDTO.fromEntity(session);
    }

    /**
     * Gets all sessions for a specific appointment.
     * (Usually there's only one session per appointment)
     *
     * @param appointmentId ID of the appointment
     * @return List of session details
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
     * Gets all active sessions for a patient.
     *
     * @param patientId ID of the patient
     * @return List of active sessions
     */
    public List<SessionDetailsDTO> getActiveSessionsForPatient(Long patientId) {
        return sessionRepository.findByPatientIdAndStatusIn(
                patientId,
                List.of(VideoSession.SessionStatus.ACTIVE, VideoSession.SessionStatus.SCHEDULED))
                .stream()
                .map(SessionDetailsDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Gets all active sessions for a doctor.
     *
     * @param doctorId ID of the doctor
     * @return List of active sessions
     */
    public List<SessionDetailsDTO> getActiveSessionsForDoctor(Long doctorId) {
        return sessionRepository.findByDoctorIdAndStatusIn(
                doctorId,
                List.of(VideoSession.SessionStatus.ACTIVE, VideoSession.SessionStatus.SCHEDULED))
                .stream()
                .map(SessionDetailsDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Checks for and updates missed sessions.
     * Called by scheduled job (every few minutes).
     * Marks sessions that were scheduled but never started as MISSED.
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

    /**
     * Validates if a user can join a session.
     * Used for security checks.
     *
     * @param sessionId Session ID
     * @param userId User ID
     * @param userRole User role
     * @return true if user can join
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
     * Generates an Agora RTC token for a channel + user.
     */
    public TokenGenerateResponse generateToken(TokenGenerateRequest request) {
        if (!agoraTokenService.isValidChannelName(request.getChannelName())) {
            throw new IllegalArgumentException("Invalid channel name");
        }

        String token = agoraTokenService.generatePublisherToken(
                request.getChannelName(),
                request.getUserAccount()
        );

        return TokenGenerateResponse.builder()
                .token(token)
                .appId(agoraTokenService.getAppId())
                .build();
    }

    /**
     * Gets the Agora App ID for client-side SDK initialization.
     * This is sent to the frontend so the Agora SDK can be initialized.
     */
    public String getAppId() {
        return agoraTokenService.getAppId();
    }
}

