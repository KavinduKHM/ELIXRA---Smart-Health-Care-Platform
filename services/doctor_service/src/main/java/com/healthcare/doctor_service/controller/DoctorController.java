package com.healthcare.doctor_service.controller;

import com.healthcare.doctor_service.dto.*;
import com.healthcare.doctor_service.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Doctor Controller - Handles all doctor-related operations
 *
 * Endpoints:
 * - Doctor profile management
 * - Availability management
 * - Prescription management
 */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // ==================== Doctor Profile Endpoints ====================

    /**
     * Register a new doctor profile
     * POST /api/doctors/register
     */
    @PostMapping("/register")
    public ResponseEntity<DoctorDTO> registerDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        DoctorDTO doctor = doctorService.registerDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(doctor);
    }

    /**
     * Get all prescriptions for a specific patient (used by Patient Service)
     */
    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        List<PrescriptionDTO> prescriptions = doctorService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    /**
     * Get doctor profile by ID
     * GET /api/doctors/{doctorId}
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable Long doctorId) {
        DoctorDTO doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Get doctor profile by User ID (from auth token)
     * GET /api/doctors/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<DoctorDTO> getDoctorByUserId(@PathVariable Long userId) {
        DoctorDTO doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Update doctor profile
     * PUT /api/doctors/{doctorId}/profile
     */
    @PutMapping("/{doctorId}/profile")
    public ResponseEntity<DoctorDTO> updateProfile(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorRegistrationRequest request) {
        DoctorDTO doctor = doctorService.updateProfile(doctorId, request);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Search doctors by specialty and/or name.
     *
     * NOTE: appointment-service calls this via Feign:
     * GET /api/doctors/search?specialty=...&name=...
     */
    @GetMapping("/search")
    public ResponseEntity<List<DoctorDTO>> searchDoctors(
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "name", required = false) String name) {

        String q = "";
        if (specialty != null && !specialty.isBlank()) {
            q = specialty.trim();
        }
        if (name != null && !name.isBlank()) {
            q = (q.isBlank() ? "" : (q + " ")) + name.trim();
        }

        List<DoctorDTO> doctors = doctorService.searchDoctors(q, Pageable.unpaged()).getContent();
        return ResponseEntity.ok(doctors);
    }

    /**
     * Search doctors by name or specialty (paged, for UI usage)
     * GET /api/doctors/search-page?q={search}
     */
    @GetMapping("/search-page")
    public ResponseEntity<Page<DoctorDTO>> searchDoctorsPaged(
            @RequestParam(required = false, defaultValue = "") String q,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<DoctorDTO> doctors = doctorService.searchDoctors(q, pageable);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Get doctors by specialty
     * GET /api/doctors/specialty/{specialty}
     */
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialty(@PathVariable String specialty) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialty(specialty);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Get all verified doctors (public)
     * GET /api/doctors/verified
     */
    @GetMapping("/verified")
    public ResponseEntity<List<DoctorDTO>> getVerifiedDoctors() {
        List<DoctorDTO> doctors = doctorService.getVerifiedDoctors();
        return ResponseEntity.ok(doctors);
    }

    // ==================== Admin Endpoints ====================

    /**
     * Verify doctor (Admin only)
     * PUT /api/doctors/{doctorId}/verify
     */
    @PutMapping("/{doctorId}/verify")
    public ResponseEntity<DoctorDTO> verifyDoctor(@PathVariable Long doctorId) {
        DoctorDTO doctor = doctorService.verifyDoctor(doctorId);
        return ResponseEntity.ok(doctor);
    }

    /**
     * Suspend doctor (Admin only)
     * PUT /api/doctors/{doctorId}/suspend
     */
    @PutMapping("/{doctorId}/suspend")
    public ResponseEntity<DoctorDTO> suspendDoctor(@PathVariable Long doctorId) {
        DoctorDTO doctor = doctorService.suspendDoctor(doctorId);
        return ResponseEntity.ok(doctor);
    }

    // ==================== Availability Endpoints ====================

    /**
     * Set doctor availability
     * POST /api/doctors/{doctorId}/availability
     */
    @PostMapping("/{doctorId}/availability")
    public ResponseEntity<AvailabilityDTO> setAvailability(
            @PathVariable Long doctorId,
            @Valid @RequestBody AvailabilityRequest request) {
        AvailabilityDTO availability = doctorService.setAvailability(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(availability);
    }

    /**
     * Get all availabilities for a doctor
     * GET /api/doctors/{doctorId}/availability
     */
    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<List<AvailabilityDTO>> getDoctorAvailabilities(@PathVariable Long doctorId) {
        List<AvailabilityDTO> availabilities = doctorService.getDoctorAvailabilities(doctorId);
        return ResponseEntity.ok(availabilities);
    }

    /**
     * Get available slots for a doctor on a specific date
     * GET /api/doctors/{doctorId}/availability/slots?date={date}
     */
    @GetMapping("/{doctorId}/availability/slots")
    public ResponseEntity<List<AvailabilityDTO>> getAvailableSlots(
            @PathVariable Long doctorId,
            @RequestParam LocalDate date) {
        List<AvailabilityDTO> slots = doctorService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }

    /**
     * Delete availability slot
     * DELETE /api/doctors/{doctorId}/availability/{availabilityId}
     */
    @DeleteMapping("/{doctorId}/availability/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long doctorId,
            @PathVariable Long availabilityId) {
        doctorService.deleteAvailability(doctorId, availabilityId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Prescription Endpoints ====================

    /**
     * Issue a digital prescription
     * POST /api/doctors/{doctorId}/prescriptions
     */
    @PostMapping("/{doctorId}/prescriptions")
    public ResponseEntity<PrescriptionDTO> issuePrescription(
            @PathVariable Long doctorId,
            @Valid @RequestBody PrescriptionRequest request) {
        PrescriptionDTO prescription = doctorService.issuePrescription(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescription);
    }

    /**
     * Get all prescriptions for a doctor
     * GET /api/doctors/{doctorId}/prescriptions
     */
    @GetMapping("/{doctorId}/prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> getDoctorPrescriptions(@PathVariable Long doctorId) {
        List<PrescriptionDTO> prescriptions = doctorService.getDoctorPrescriptions(doctorId);
        return ResponseEntity.ok(prescriptions);
    }

    /**
     * Get prescription by ID
     * GET /api/doctors/prescriptions/{prescriptionId}
     */
    @GetMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long prescriptionId) {
        PrescriptionDTO prescription = doctorService.getPrescriptionById(prescriptionId);
        return ResponseEntity.ok(prescription);
    }

    /**
     * Check if a doctor is available at a specific date and time.
     * Used by Appointment Service to validate slot before booking.
     *
     * GET /api/doctors/{doctorId}/check-availability?time=2024-04-10T10:00:00
     */
    @GetMapping("/{doctorId}/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime time) {

        boolean available = doctorService.isDoctorAvailable(doctorId, time);
        return ResponseEntity.ok(available);
    }

    /**
     * Book a time slot (mark as booked) after an appointment is confirmed.
     * Used by Appointment Service to prevent double‑booking.
     *
     * POST /api/doctors/{doctorId}/book-slot?time=2024-04-10T10:00:00
     */
    @PostMapping("/{doctorId}/book-slot")
    public ResponseEntity<Void> bookTimeSlot(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime time) {

        doctorService.bookTimeSlot(doctorId, time);
        return ResponseEntity.ok().build();
    }
}