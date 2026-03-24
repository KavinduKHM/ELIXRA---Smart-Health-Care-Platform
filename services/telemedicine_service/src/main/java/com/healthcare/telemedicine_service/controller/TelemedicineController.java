package com.healthcare.telemedicine_service.controller;

import com.healthcare.telemedicine_service.dto.CreateSessionRequest;
import com.healthcare.telemedicine_service.dto.EndSessionRequest;
import com.healthcare.telemedicine_service.dto.JoinSessionRequest;
import com.healthcare.telemedicine_service.dto.JoinSessionResponse;
import com.healthcare.telemedicine_service.dto.SessionDetailsDTO;
import com.healthcare.telemedicine_service.service.TelemedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Telemedicine Service.
 *
 * Endpoints:
 * - POST /api/video/sessions - Create a new video session
 * - POST /api/video/sessions/join - Join a video session
 * - POST /api/video/sessions/end - End a video session
 * - POST /api/video/sessions/{id}/cancel - Cancel a session
 * - GET /api/video/sessions/{id} - Get session details
 * - GET /api/video/appointments/{appointmentId} - Get sessions by appointment
 * - GET /api/video/patients/{patientId}/active - Get active sessions for patient
 * - GET /api/video/doctors/{doctorId}/active - Get active sessions for doctor
 */
@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
@Slf4j
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    /**
     * Quick smoke-test endpoint.
     */
    @GetMapping
    public ResponseEntity<String> base() {
        return ResponseEntity.ok("Telemedicine service is running");
    }

    /**
     * Creates a new video session for an appointment.
     * Usually called by the Appointment Service when a new appointment is created.
     */
    @PostMapping("/sessions")
    public ResponseEntity<SessionDetailsDTO> createSession(
            @Valid @RequestBody CreateSessionRequest request) {
        log.info("POST /api/video/sessions - Creating session for appointment: {}",
                request.getAppointmentId());

        SessionDetailsDTO session = telemedicineService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * Joins a video session.
     * Generates an Agora token for the user to connect to the video call.
     */
    @PostMapping("/sessions/join")
    public ResponseEntity<JoinSessionResponse> joinSession(
            @Valid @RequestBody JoinSessionRequest request) {
        log.info("POST /api/video/sessions/join - User {} joining session: {}",
                request.getUserId(), request.getSessionId());

        JoinSessionResponse response = telemedicineService.joinSession(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Ends a video session.
     * Calculates duration and updates session status.
     */
    @PostMapping("/sessions/end")
    public ResponseEntity<SessionDetailsDTO> endSession(
            @Valid @RequestBody EndSessionRequest request) {
        log.info("POST /api/video/sessions/end - Ending session: {}",
                request.getSessionId());

        SessionDetailsDTO session = telemedicineService.endSession(request);
        return ResponseEntity.ok(session);
    }

    /**
     * Cancels a scheduled video session.
     */
    @PostMapping("/sessions/{id}/cancel")
    public ResponseEntity<SessionDetailsDTO> cancelSession(
            @PathVariable Long id,
            @RequestParam Long userId) {
        log.info("POST /api/video/sessions/{}/cancel - Cancelling session", id);

        SessionDetailsDTO session = telemedicineService.cancelSession(id, userId);
        return ResponseEntity.ok(session);
    }

    /**
     * Gets details of a specific video session.
     */
    @GetMapping("/sessions/{id}")
    public ResponseEntity<SessionDetailsDTO> getSessionDetails(
            @PathVariable Long id) {
        log.info("GET /api/video/sessions/{} - Getting session details", id);

        SessionDetailsDTO session = telemedicineService.getSessionDetails(id);
        return ResponseEntity.ok(session);
    }

    /**
     * Gets all video sessions for a specific appointment.
     */
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<List<SessionDetailsDTO>> getSessionsByAppointment(
            @PathVariable Long appointmentId) {
        log.info("GET /api/video/appointments/{} - Getting sessions by appointment",
                appointmentId);

        List<SessionDetailsDTO> sessions =
                telemedicineService.getSessionsByAppointment(appointmentId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Gets all active video sessions for a patient.
     */
    @GetMapping("/patients/{patientId}/active")
    public ResponseEntity<List<SessionDetailsDTO>> getActiveSessionsForPatient(
            @PathVariable Long patientId) {
        log.info("GET /api/video/patients/{}/active - Getting active sessions for patient",
                patientId);

        List<SessionDetailsDTO> sessions =
                telemedicineService.getActiveSessionsForPatient(patientId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Gets all active video sessions for a doctor.
     */
    @GetMapping("/doctors/{doctorId}/active")
    public ResponseEntity<List<SessionDetailsDTO>> getActiveSessionsForDoctor(
            @PathVariable Long doctorId) {
        log.info("GET /api/video/doctors/{}/active - Getting active sessions for doctor",
                doctorId);

        List<SessionDetailsDTO> sessions =
                telemedicineService.getActiveSessionsForDoctor(doctorId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Checks if a user can join a specific session.
     * Useful for authorization before attempting to join.
     */
    @GetMapping("/sessions/{id}/can-join")
    public ResponseEntity<Boolean> canJoinSession(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam String userRole) {
        log.info("GET /api/video/sessions/{}/can-join - Checking if user {} can join",
                id, userId);

        boolean canJoin = telemedicineService.canJoinSession(id, userId, userRole);
        return ResponseEntity.ok(canJoin);
    }

    @GetMapping
    public ResponseEntity<String> welcome() {
        return ResponseEntity.ok("✅ Telemedicine Service is running!\n\n" +
                "Available endpoints:\n" +
                "- POST /api/video/sessions - Create a session\n" +
                "- POST /api/video/sessions/join - Join a session\n" +
                "- POST /api/video/sessions/end - End a session\n" +
                "- GET /api/video/sessions/{id} - Get session details\n" +
                "- GET /api/video/patients/{patientId}/active - Patient's active sessions\n" +
                "- GET /api/video/doctors/{doctorId}/active - Doctor's active sessions");
    }

    @GetMapping
    public ResponseEntity<String> welcome() {
        return ResponseEntity.ok("✅ Telemedicine Service is running!");
    }
}