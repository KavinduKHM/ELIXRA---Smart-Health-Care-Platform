package com.healthcare.appointment_service.controller;

import com.healthcare.appointment_service.dto.*;
import com.healthcare.appointment_service.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for managing appointments.
 *
 * All endpoints are prefixed with /api/appointments
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ==================== Doctor Search Endpoints ====================

    /**
     * Search for doctors by specialty
     * GET /api/appointments/doctors/search?specialty=Cardiology&date=2024-01-15
     */
    @GetMapping("/doctors/search")
    public ResponseEntity<List<DoctorSearchResponse>> searchDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        SearchRequest request = new SearchRequest();
        request.setSpecialty(specialty);
        request.setDoctorName(name);
        request.setDate(date);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(appointmentService.searchDoctors(request));
    }

    /**
     * Get available time slots for a doctor
     * GET /api/appointments/doctors/{doctorId}/slots?date=2024-01-15
     */
    @GetMapping("/doctors/{doctorId}/slots")
    public ResponseEntity<List<TimeSlotDTO>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {

        return ResponseEntity.ok(appointmentService.getAvailableSlots(doctorId, date));
    }

    // ==================== Appointment CRUD Endpoints ====================

    /**
     * Book a new appointment
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get appointment by ID
     * GET /api/appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    /**
     * Get all appointments for a patient
     * GET /api/appointments/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId, page, size));
    }

    /**
     * Get all appointments for a doctor
     * GET /api/appointments/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<Page<AppointmentResponse>> getAppointmentsByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId, page, size));
    }

    /**
     * Get upcoming appointments for a patient
     * GET /api/appointments/patient/{patientId}/upcoming
     */
    @GetMapping("/patient/{patientId}/upcoming")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointmentsForPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(appointmentService.getUpcomingAppointmentsForPatient(patientId));
    }

    // ==================== Status Management Endpoints ====================

    /**
     * Update appointment status (doctor confirms/cancels/completes)
     * PATCH /api/appointments/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, request));
    }

    /**
     * Cancel an appointment
     * DELETE /api/appointments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) CancelRequest request) {

        CancelRequest cancelRequest = request != null ? request : new CancelRequest();
        return ResponseEntity.ok(appointmentService.cancelAppointment(id, cancelRequest));
    }

    /**
     * Reschedule an appointment
     * PUT /api/appointments/{id}/reschedule
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequest request) {

        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request));
    }

    // ==================== Doctor-specific Endpoints ====================

    /**
     * Get pending appointments for a doctor (needs confirmation)
     * GET /api/appointments/doctor/{doctorId}/pending
     */
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<List<AppointmentResponse>> getPendingAppointmentsForDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(appointmentService.getPendingAppointmentsForDoctor(doctorId));
    }

    /**
     * Get upcoming confirmed appointments for a doctor
     * GET /api/appointments/doctor/{doctorId}/upcoming
     */
    @GetMapping("/doctor/{doctorId}/upcoming")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingConfirmedAppointmentsForDoctor(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(appointmentService.getUpcomingConfirmedAppointmentsForDoctor(doctorId));
    }

    /**
     * Confirm an appointment (doctor accepts)
     * POST /api/appointments/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<AppointmentResponse> confirmAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) String notes) {

        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus(com.healthcare.appointment_service.model.AppointmentStatus.CONFIRMED);
        request.setNotes(notes);

        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, request));
    }

    /**
     * Complete an appointment (consultation finished)
     * POST /api/appointments/{id}/complete
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<AppointmentResponse> completeAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) String notes) {

        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus(com.healthcare.appointment_service.model.AppointmentStatus.COMPLETED);
        request.setNotes(notes);

        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, request));
    }
}