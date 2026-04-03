package com.healthcare.doctor_service.client;

import com.healthcare.doctor_service.dto.telemedicine.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client for Telemedicine Service.
 *
 * Uses service discovery (Eureka). The service name must match:
 *  spring.application.name in telemedicine-service -> "telemedicine-service"
 */
@FeignClient(name = "telemedicine-service", path = "/api/video")
public interface TelemedicineClient {

    @PostMapping("/sessions")
    SessionDetailsDTO createSession(@RequestBody CreateSessionRequest request);

    @PostMapping("/sessions/join")
    JoinSessionResponse joinSession(@RequestBody JoinSessionRequest request);

    @PostMapping("/sessions/end")
    SessionDetailsDTO endSession(@RequestBody EndSessionRequest request);

    @PostMapping("/sessions/{id}/cancel")
    SessionDetailsDTO cancelSession(@PathVariable("id") Long sessionId,
                                    @RequestParam("userId") Long userId);

    @GetMapping("/sessions/{id}")
    SessionDetailsDTO getSessionDetails(@PathVariable("id") Long sessionId);

    @GetMapping("/appointments/{appointmentId}")
    List<SessionDetailsDTO> getSessionsByAppointment(@PathVariable("appointmentId") Long appointmentId);

    @GetMapping("/doctors/{doctorId}/active")
    List<SessionDetailsDTO> getActiveSessionsForDoctor(@PathVariable("doctorId") Long doctorId);

    @GetMapping("/sessions/{id}/can-join")
    Boolean canJoin(@PathVariable("id") Long sessionId,
                   @RequestParam("userId") Long userId,
                   @RequestParam("userRole") String userRole);
}

