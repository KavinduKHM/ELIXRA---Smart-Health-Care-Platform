package com.healthcare.doctor_service.controller;

import com.healthcare.doctor_service.client.TelemedicineClient;
import com.healthcare.doctor_service.dto.telemedicine.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Doctor-facing endpoints that proxy telemedicine-service video session operations.
 *
 * Why this exists:
 * - The frontend (or other services) may prefer to call doctor-service for doctor actions.
 * - doctor-service uses Eureka + Feign to discover telemedicine-service.
 */
@RestController
@RequestMapping("/api/doctors/video")
@RequiredArgsConstructor
@Slf4j
public class DoctorVideoSessionController {

    private final TelemedicineClient telemedicineClient;

    /**
     * Create a video session for an appointment.
     * Typically this is automated by appointment-service, but exposing it is useful for admin/testing.
     */
    @PostMapping("/sessions")
    public ResponseEntity<SessionDetailsDTO> create(@RequestBody DoctorCreateVideoSessionRequest body) {
        log.info("DoctorVideoSessionController.create appointmentId={}", body.getAppointmentId());

        CreateSessionRequest request = new CreateSessionRequest();
        request.setAppointmentId(body.getAppointmentId());
        request.setPatientId(body.getPatientId());
        request.setDoctorId(body.getDoctorId());
        request.setScheduledStartTime(body.getScheduledStartTime());

        SessionDetailsDTO created = telemedicineClient.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Doctor joins a video session and receives Agora token + channel.
     */
    @PostMapping("/sessions/join")
    public ResponseEntity<JoinSessionResponse> join(@RequestBody DoctorJoinVideoSessionRequest body) {
        log.info("DoctorVideoSessionController.join sessionId={} doctorId={}", body.getSessionId(), body.getDoctorId());

        JoinSessionRequest request = new JoinSessionRequest();
        request.setSessionId(body.getSessionId());
        request.setUserId(body.getDoctorId());
        request.setUserRole("DOCTOR");

        return ResponseEntity.ok(telemedicineClient.joinSession(request));
    }

    /**
     * Doctor ends a video session.
     */
    @PostMapping("/sessions/end")
    public ResponseEntity<SessionDetailsDTO> end(@RequestBody DoctorEndVideoSessionRequest body) {
        log.info("DoctorVideoSessionController.end sessionId={} doctorId={}", body.getSessionId(), body.getDoctorId());

        EndSessionRequest request = new EndSessionRequest();
        request.setSessionId(body.getSessionId());
        request.setUserId(body.getDoctorId());
        request.setConsultationNotes(body.getConsultationNotes());

        return ResponseEntity.ok(telemedicineClient.endSession(request));
    }

    /**
     * Doctor cancels a scheduled session.
     */
    @PostMapping("/sessions/{id}/cancel")
    public ResponseEntity<SessionDetailsDTO> cancel(@PathVariable("id") Long sessionId,
                                                   @RequestParam("doctorId") Long doctorId) {
        log.info("DoctorVideoSessionController.cancel sessionId={} doctorId={}", sessionId, doctorId);
        return ResponseEntity.ok(telemedicineClient.cancelSession(sessionId, doctorId));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<SessionDetailsDTO> get(@PathVariable("id") Long sessionId) {
        return ResponseEntity.ok(telemedicineClient.getSessionDetails(sessionId));
    }

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<List<SessionDetailsDTO>> byAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(telemedicineClient.getSessionsByAppointment(appointmentId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<SessionDetailsDTO>> activeForDoctor(@RequestParam("doctorId") Long doctorId) {
        return ResponseEntity.ok(telemedicineClient.getActiveSessionsForDoctor(doctorId));
    }
}

