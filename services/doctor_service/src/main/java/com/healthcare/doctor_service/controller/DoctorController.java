package com.healthcare.doctor_service.controller;

import com.healthcare.doctor_service.dto.*;
import com.healthcare.doctor_service.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.healthcare.doctor_service.dto.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.healthcare.doctor_service.client.TelemedicineServiceClient;
import com.healthcare.doctor_service.dto.telemedicine.CreateVideoSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.VideoSessionDetailsDTO;
import com.healthcare.doctor_service.dto.telemedicine.JoinVideoSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.JoinVideoSessionResponse;
import com.healthcare.doctor_service.dto.telemedicine.TelemedicineJoinSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.EndVideoSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.TelemedicineEndSessionRequest;

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
    private final TelemedicineServiceClient telemedicineServiceClient;

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
     * Search doctors by name or specialty (public endpoint for patients)
     * GET /api/doctors/search?q={search}
     */
    @GetMapping("/search")
    public ResponseEntity<Page<DoctorDTO>> searchDoctors(
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

    // ==================== Telemedicine (Video Session) Endpoints ====================

    /**
     * Create a new video session (Doctor initiates).
     * POST /api/doctors/video/sessions
     */
    @PostMapping("/video/sessions")
    public ResponseEntity<VideoSessionDetailsDTO> createVideoSession(
            @Valid @RequestBody CreateVideoSessionRequest request) {
        VideoSessionDetailsDTO created = telemedicineServiceClient.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Join an existing video session as doctor.
     * POST /api/doctors/video/sessions/join
     */
    @PostMapping("/video/sessions/join")
    public ResponseEntity<JoinVideoSessionResponse> joinVideoSession(
            @Valid @RequestBody JoinVideoSessionRequest request) {

        TelemedicineJoinSessionRequest tReq = new TelemedicineJoinSessionRequest();
        tReq.setSessionId(request.getSessionId());
        tReq.setUserId(request.getDoctorId());
        tReq.setUserRole("DOCTOR");

        JoinVideoSessionResponse resp = telemedicineServiceClient.joinSession(tReq);
        return ResponseEntity.ok(resp);
    }

    /**
     * End a video session as doctor.
     * POST /api/doctors/video/sessions/end
     */
    @PostMapping("/video/sessions/end")
    public ResponseEntity<VideoSessionDetailsDTO> endVideoSession(
            @Valid @RequestBody EndVideoSessionRequest request) {

        TelemedicineEndSessionRequest tReq = new TelemedicineEndSessionRequest();
        tReq.setSessionId(request.getSessionId());
        tReq.setUserId(request.getDoctorId());
        tReq.setConsultationNotes(request.getConsultationNotes());

        VideoSessionDetailsDTO ended = telemedicineServiceClient.endSession(tReq);
        return ResponseEntity.ok(ended);
    }
}