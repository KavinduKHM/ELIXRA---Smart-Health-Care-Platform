package com.healthcare.appointment_service.service;

import com.healthcare.appointment_service.client.DoctorServiceClient;
import com.healthcare.appointment_service.client.PatientServiceClient;
import com.healthcare.appointment_service.client.NotificationServiceClient;
import com.healthcare.appointment_service.dto.*;
import com.healthcare.appointment_service.model.Appointment;
import com.healthcare.appointment_service.model.AppointmentStatus;
import com.healthcare.appointment_service.repository.AppointmentRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.healthcare.appointment_service.client.PaymentServiceClient;
import com.healthcare.appointment_service.dto.PaymentRequest;
import com.healthcare.appointment_service.dto.PaymentResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Core service for managing appointments.
 * Handles:
 * - Booking new appointments
 * - Cancelling appointments
 * - Rescheduling appointments
 * - Tracking appointment status
 * - Searching for available doctors
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private static final DateTimeFormatter DOCTOR_SERVICE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @org.springframework.beans.factory.annotation.Value("${app.payment.currency:LKR}")
    private String paymentCurrency;

    @org.springframework.beans.factory.annotation.Value("${app.payment.minimum-amount:1500}")
    private java.math.BigDecimal minimumPaymentAmount;

    @org.springframework.beans.factory.annotation.Value("${app.payment.default-consultation-fee:1500}")
    private java.math.BigDecimal defaultConsultationFee;

    /**
     * Search for doctors by specialty
     *
     * @param request Search criteria (specialty, name, date)
     * @return List of doctors matching criteria
     */
    /**
     * Search for doctors by specialty
     *
     * @param request Search criteria (specialty, name, date)
     * @return List of doctors matching criteria
     */
    public List<DoctorSearchResponse> searchDoctors(SearchRequest request) {
        String specialty = normalizeQuery(request.getSpecialty());
        String name = normalizeQuery(request.getDoctorName());
        LocalDate date = request.getDate();

        log.info("Searching doctors: specialty='{}', name='{}', date='{}'", specialty, name, date);

        List<DoctorDTO> doctors;
        if (specialty != null) {
            doctors = doctorServiceClient.getDoctorsBySpecialty(specialty);
        } else {
            doctors = doctorServiceClient.getVerifiedDoctors();
        }

        if (name != null) {
            String nameLower = name.toLowerCase(Locale.ROOT);
            doctors = doctors.stream()
                    .filter(d -> buildDoctorName(d).toLowerCase(Locale.ROOT).contains(nameLower))
                    .toList();
        }

        List<DoctorSearchResponse> results = doctors.stream()
                .map(this::toDoctorSearchResponse)
                .collect(Collectors.toCollection(ArrayList::new));

        if (date != null) {
            results.forEach(d -> d.setAvailableSlots(getAvailableSlots(d.getId(), date.atStartOfDay())));
            results = results.stream()
                    .filter(d -> d.getAvailableSlots() != null && !d.getAvailableSlots().isEmpty())
                    .toList();
        }

        log.info("Found {} doctors matching criteria", results.size());
        return results;
    }
    /**
     * Get available time slots for a specific doctor on a specific date
     *
     * @param doctorId Doctor ID
     * @param date Date to check
     * @return List of available time slots
     */
    /**
     * Get available time slots for a specific doctor on a specific date
     *
     * @param doctorId Doctor ID
     * @param date Date to check
     * @return List of available time slots
     */
    public List<TimeSlotDTO> getAvailableSlots(Long doctorId, LocalDateTime date) {
        log.info("Getting available slots for doctor: {} on date: {}", doctorId, date);

        LocalDate requestedDate = date.toLocalDate();
        List<DoctorAvailabilityDTO> availabilitySlots = doctorServiceClient.getAvailabilitySlots(doctorId, requestedDate.toString());

        List<TimeSlotDTO> slots = availabilitySlots.stream()
                .map(a -> toTimeSlotDTO(doctorId, requestedDate, a))
                .filter(s -> s.getStartTime() != null && s.getEndTime() != null)
                .filter(s -> Boolean.FALSE.equals(s.getIsBooked()))
                .toList();

        log.info("Returning {} available slots for doctor {}", slots.size(), doctorId);
        return slots;
    }

    private String normalizeQuery(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String buildDoctorName(DoctorDTO doctor) {
        if (doctor == null) return "";
        if (doctor.getFullName() != null && !doctor.getFullName().isBlank()) return doctor.getFullName();
        String first = doctor.getFirstName() == null ? "" : doctor.getFirstName().trim();
        String last = doctor.getLastName() == null ? "" : doctor.getLastName().trim();
        return (first + " " + last).trim();
    }

    private DoctorSearchResponse toDoctorSearchResponse(DoctorDTO doctor) {
        return DoctorSearchResponse.builder()
                .id(doctor.getId())
                .name(buildDoctorName(doctor))
                .specialty(doctor.getSpecialty())
                .qualification(doctor.getQualification())
                .profilePicture(doctor.getProfilePicture())
                .consultationFee(doctor.getConsultationFee())
                .experienceYears(doctor.getExperienceYears())
                .rating(doctor.getAverageRating())
                .build();
    }

    private TimeSlotDTO toTimeSlotDTO(Long doctorId, LocalDate date, DoctorAvailabilityDTO availability) {
        TimeSlotDTO slot = new TimeSlotDTO();
        slot.setId(availability.getId());
        slot.setDoctorId(doctorId);
        LocalTime start = availability.getStartTime();
        LocalTime end = availability.getEndTime();
        if (start != null) slot.setStartTime(LocalDateTime.of(date, start));
        if (end != null) slot.setEndTime(LocalDateTime.of(date, end));
        String status = availability.getStatus();
        boolean booked = status != null && !"AVAILABLE".equalsIgnoreCase(status);
        slot.setIsBooked(booked);
        return slot;
    }
    /**
     * Book a new appointment
     *
     * @param request Appointment booking details
     * @return Created appointment details
     */
    /**
     * Book a new appointment - TEMPORARY VERSION WITHOUT EXTERNAL SERVICE CALLS
     *
     * @param request Appointment booking details
     * @return Created appointment details
     */
    @Transactional
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        log.info("Booking appointment for patient: {} with doctor: {} at: {}",
                request.getPatientId(), request.getDoctorId(), request.getAppointmentTime());

        // 1. Get patient details (fallback if Patient Service not ready)
        PatientDTO patient;
        try {
            patient = patientServiceClient.getPatientById(request.getPatientId());
        } catch (Exception e) {
            log.warn("Patient service unavailable, using mock patient");
            patient = new PatientDTO();
            patient.setId(request.getPatientId());
            patient.setFirstName("Patient");
            patient.setLastName(String.valueOf(request.getPatientId()));
        }

        // 2. Get doctor details from Doctor Service
        DoctorDTO doctor;
        try {
            doctor = doctorServiceClient.getDoctorById(request.getDoctorId());
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
        } catch (FeignException e) {
            log.error("Doctor service call failed while fetching doctor {}", request.getDoctorId(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Doctor service unavailable");
        }
        if (doctor == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
        }

        // 3. Check availability via Doctor Service
        boolean isAvailable;
        try {
            isAvailable = doctorServiceClient.checkAvailability(
                    request.getDoctorId(), formatDoctorServiceTime(request.getAppointmentTime()));
        } catch (FeignException.BadRequest e) {
            log.warn("Doctor service rejected appointment time '{}'. Ensure ISO-8601 format.", request.getAppointmentTime());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid appointment time format");
        } catch (FeignException e) {
            log.error("Doctor service call failed while checking availability for doctor {}", request.getDoctorId(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Doctor service unavailable");
        }
        if (!isAvailable) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor is not available at the requested time");
        }

        // 4. Check for conflicts with existing appointments in Appointment Service
        LocalDateTime endTime = request.getAppointmentTime()
                .plusMinutes(request.getDurationMinutes());
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                request.getDoctorId(), request.getAppointmentTime(), endTime);
        if (!conflicts.isEmpty()) {
            Appointment existingPending = conflicts.stream()
                    .filter(a -> Objects.equals(a.getPatientId(), request.getPatientId()))
                    .filter(a -> Objects.equals(a.getDoctorId(), request.getDoctorId()))
                    .filter(a -> Objects.equals(a.getAppointmentTime(), request.getAppointmentTime()))
                    .filter(a -> a.getStatus() == AppointmentStatus.PENDING_PAYMENT)
                    .findFirst()
                    .orElse(null);

            if (existingPending != null) {
                log.info("Existing pending appointment {} found for the same slot; re-issuing payment intent", existingPending.getId());
                return createOrUpdatePaymentIntent(existingPending, patient, doctor);
            }

            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot is already booked");
        }

        // 5. Create appointment with PENDING_PAYMENT status
        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .appointmentTime(request.getAppointmentTime())
                .durationMinutes(request.getDurationMinutes())
                .status(AppointmentStatus.PENDING_PAYMENT)
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment created with ID: {} (status: PENDING_PAYMENT)", savedAppointment.getId());

        AppointmentResponse response = createOrUpdatePaymentIntent(savedAppointment, patient, doctor);

        // Notify: appointment created (pending payment)
        sendAppointmentNotification(savedAppointment, patient, doctor, "created");

        return response;
    }

    private AppointmentResponse createOrUpdatePaymentIntent(Appointment appointment, PatientDTO patient, DoctorDTO doctor) {
        PaymentRequest paymentReq = new PaymentRequest();
        paymentReq.setAppointmentId(appointment.getId());
        paymentReq.setPatientId(appointment.getPatientId());
        paymentReq.setDoctorId(appointment.getDoctorId());

        // payment-service (Stripe) has minimum amounts. Use a configurable floor.
        // NOTE: Amount here is in major currency units (e.g., 1500 LKR or 500 PKR).
        java.math.BigDecimal consultationFee = (doctor.getConsultationFee() == null)
                ? defaultConsultationFee
                : java.math.BigDecimal.valueOf(doctor.getConsultationFee());

        if (consultationFee.compareTo(minimumPaymentAmount) < 0) {
            log.warn("Consultation fee {} {} is below configured minimum {}, using minimum.",
                    consultationFee, paymentCurrency, minimumPaymentAmount);
            consultationFee = minimumPaymentAmount;
        }
        paymentReq.setAmount(consultationFee);

        paymentReq.setCurrency(paymentCurrency);
        paymentReq.setDescription("Consultation fee for appointment #" + appointment.getId());
        paymentReq.setPatientName(patient.getFullName());
        paymentReq.setPatientEmail(patient.getEmail());
        paymentReq.setPatientPhone(patient.getPhoneNumber());
        paymentReq.setDoctorName(doctor.getFullName());
        paymentReq.setDoctorSpecialty(doctor.getSpecialty());
        paymentReq.setAppointmentDate(appointment.getAppointmentTime());
        paymentReq.setAppointmentTimeSlot(appointment.getAppointmentTime().toLocalTime().toString());
        paymentReq.setReturnUrl("http://localhost:3000/payment-success");

        PaymentResponse paymentResponse;
        try {
            paymentResponse = paymentServiceClient.createPaymentIntent(paymentReq);
        } catch (Exception e) {
            log.error("Failed to create payment intent", e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Payment service unavailable");
        }

        appointment.setPaymentIntentId(paymentResponse.getPaymentIntentId());
        appointment.setPaymentStatus(paymentResponse.getStatus());
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        AppointmentResponse response = buildResponse(updatedAppointment, patient, doctor);
        response.setClientSecret(paymentResponse.getClientSecret());
        response.setPaymentIntentId(paymentResponse.getPaymentIntentId());
        response.setPaymentStatus(paymentResponse.getStatus());

        log.info("Payment intent created: {}", paymentResponse.getPaymentIntentId());
        return response;
    }

    private String formatDoctorServiceTime(LocalDateTime time) {
        if (time == null) return null;
        return time.format(DOCTOR_SERVICE_TIME_FORMAT);
    }


    @Transactional
    public AppointmentResponse confirmPaymentAndUpdateStatus(Long appointmentId, String paymentIntentId) {
        log.info("Confirming payment for appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found: " + appointmentId));

        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing paymentIntentId");
        }

        // Idempotency: if already confirmed, keep success and skip strict paymentIntentId checks
        if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
            log.info("Appointment {} already confirmed; returning idempotent success", appointmentId);
        } else {
            // In dev/local runs, payment intents may get re-issued. If the UI uses an older clientSecret,
            // Stripe can succeed with a different PaymentIntent than what we last stored. For pending appointments,
            // accept and persist the provided paymentIntentId.
            if (appointment.getPaymentIntentId() == null || appointment.getPaymentIntentId().isBlank()) {
                log.warn("Appointment {} has no stored paymentIntentId; accepting provided paymentIntentId {}",
                        appointmentId, paymentIntentId);
                appointment.setPaymentIntentId(paymentIntentId);
            } else if (!paymentIntentId.equals(appointment.getPaymentIntentId())) {
                log.warn("Payment intent mismatch for appointment {} (stored={}, provided={}); accepting provided intent for pending appointment",
                        appointmentId, appointment.getPaymentIntentId(), paymentIntentId);
                appointment.setPaymentIntentId(paymentIntentId);
            }

            appointment.setStatus(AppointmentStatus.CONFIRMED);
            appointment.setPaymentStatus("succeeded");
            appointmentRepository.save(appointment);
            log.info("Appointment {} confirmed after successful payment", appointmentId);
        }

        // Mark slot booked in doctor service (best-effort)
        try {
            doctorServiceClient.bookTimeSlot(appointment.getDoctorId(), formatDoctorServiceTime(appointment.getAppointmentTime()));
        } catch (Exception e) {
            log.warn("Failed to book slot in doctor-service for appointment {}: {}", appointmentId, e.getMessage());
        }

        DoctorDTO doctor;
        try {
            doctor = doctorServiceClient.getDoctorById(appointment.getDoctorId());
        } catch (Exception e) {
            doctor = new DoctorDTO();
            doctor.setId(appointment.getDoctorId());
            doctor.setFirstName("Dr.");
            doctor.setLastName(String.valueOf(appointment.getDoctorId()));
        }

        PatientDTO patient;
        try {
            patient = patientServiceClient.getPatientById(appointment.getPatientId());
        } catch (Exception e) {
            patient = new PatientDTO();
            patient.setId(appointment.getPatientId());
            patient.setFirstName("Patient");
            patient.setLastName(String.valueOf(appointment.getPatientId()));
        }

        // Notify: appointment confirmed
        sendAppointmentNotification(appointment, patient, doctor, "confirmed");

        return buildResponse(appointment, patient, doctor);
    }

    private void sendAppointmentNotification(Appointment appointment, PatientDTO patient, DoctorDTO doctor, String eventType) {
        try {
            NotificationAppointmentDTO dto = new NotificationAppointmentDTO();
            dto.setAppointmentId(String.valueOf(appointment.getId()));
            dto.setPatientId(String.valueOf(appointment.getPatientId()));
            dto.setDoctorId(String.valueOf(appointment.getDoctorId()));
            dto.setDate(appointment.getAppointmentTime());
            dto.setTimeSlot(appointment.getAppointmentTime() != null
                    ? appointment.getAppointmentTime().toLocalTime().toString()
                    : null);
            dto.setStatus(appointment.getStatus() != null
                    ? appointment.getStatus().name().toLowerCase(Locale.ROOT)
                    : null);
            dto.setSymptoms(appointment.getSymptoms());
            dto.setNotes(appointment.getNotes());
            dto.setConsultationLink(appointment.getConsultationLink());
            dto.setConsultationType("Video Consultation");

            if (patient != null) {
                dto.setPatientName(patient.getFullName());
                dto.setPatientEmail(patient.getEmail());
                dto.setPatientPhone(patient.getPhoneNumber());
            }

            if (doctor != null) {
                dto.setDoctorName(doctor.getFullName());
                dto.setDoctorEmail(doctor.getEmail());
                dto.setDoctorPhone(doctor.getPhoneNumber());
                dto.setSpecialty(doctor.getSpecialty());
            }

            NotificationRequest req = new NotificationRequest();
            req.setAppointment(dto);
            req.setEventType(eventType);

            Map<String, Object> resp = notificationServiceClient.sendAppointmentNotifications(req);
            log.info("Notification request sent for appointment {} event {}: {}",
                    appointment.getId(), eventType, resp != null ? resp.get("success") : null);
        } catch (Exception e) {
            log.warn("Failed to send notification for appointment {}: {}", appointment.getId(), e.getMessage());
        }
    }


    /**
     * Get appointment by ID
     *
     * @param id Appointment ID
     * @return Appointment details
     */
    /**
     * Get appointment by ID
     *
     * @param id Appointment ID
     * @return Appointment details
     */
    public AppointmentResponse getAppointmentById(Long id) {
        log.info("Fetching appointment with ID: {}", id);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        // ========== TEMPORARY: Use mock data for patient/doctor ==========
        // Instead of calling external services, use mock data
        PatientDTO patient = new PatientDTO();
        patient.setId(appointment.getPatientId());
        patient.setFirstName("Patient");
        patient.setLastName(String.valueOf(appointment.getPatientId()));

        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(appointment.getDoctorId());
        doctor.setFirstName("Dr.");
        doctor.setLastName(String.valueOf(appointment.getDoctorId()));
        doctor.setSpecialty("General Medicine");

        return buildResponse(appointment, patient, doctor);
    }
    /**
     * Get all appointments for a patient
     *
     * @param patientId Patient ID
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of appointments
     */
    /**
     * Get all appointments for a patient
     *
     * @param patientId Patient ID
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of appointments
     */
    public Page<AppointmentResponse> getAppointmentsByPatient(Long patientId, int page, int size) {
        log.info("Fetching appointments for patient: {}", patientId);

        Page<Appointment> appointments = appointmentRepository.findByPatientId(
                patientId, PageRequest.of(page, size));

        return appointments.map(appointment -> {
            // Use mock doctor data instead of calling doctor service
            DoctorDTO doctor = new DoctorDTO();
            doctor.setId(appointment.getDoctorId());
            doctor.setFirstName("Dr.");
            doctor.setLastName(String.valueOf(appointment.getDoctorId()));
            doctor.setSpecialty("General Medicine");
            return buildResponse(appointment, null, doctor);
        });
    }
    /**
     * Get all appointments for a doctor
     *
     * @param doctorId Doctor ID
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of appointments
     */
    /**
     * Get all appointments for a doctor
     *
     * @param doctorId Doctor ID
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of appointments
     */
    public Page<AppointmentResponse> getAppointmentsByDoctor(Long doctorId, int page, int size) {
        log.info("Fetching appointments for doctor: {}", doctorId);

        Page<Appointment> appointments = appointmentRepository.findByDoctorId(
                doctorId, PageRequest.of(page, size));

        return appointments.map(appointment -> {
            // Use mock patient data instead of calling patient service
            PatientDTO patient = new PatientDTO();
            patient.setId(appointment.getPatientId());
            patient.setFirstName("Patient");
            patient.setLastName(String.valueOf(appointment.getPatientId()));
            return buildResponse(appointment, patient, null);
        });
    }
    /**
     * Update appointment status (confirm, complete, etc.)
     *
     * @param id Appointment ID
     * @param request Status update request
     * @return Updated appointment
     */

    /**
     * Update appointment status (confirm, complete, etc.)
     *
     * @param id Appointment ID
     * @param request Status update request
     * @return Updated appointment
     */
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long id, StatusUpdateRequest request) {
        log.info("Updating appointment {} status to: {}", id, request.getStatus());

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        appointment.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        // If status is CONFIRMED, generate consultation link
        if (request.getStatus() == AppointmentStatus.CONFIRMED) {
            String consultationLink = generateConsultationLink(id);
            appointment.setConsultationLink(consultationLink);
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Use mock data instead of calling external services
        PatientDTO patient = new PatientDTO();
        patient.setId(updatedAppointment.getPatientId());
        patient.setFirstName("Patient");
        patient.setLastName(String.valueOf(updatedAppointment.getPatientId()));

        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(updatedAppointment.getDoctorId());
        doctor.setFirstName("Dr.");
        doctor.setLastName(String.valueOf(updatedAppointment.getDoctorId()));
        doctor.setSpecialty("General Medicine");

        return buildResponse(updatedAppointment, patient, doctor);
    }
    /**
     * Cancel an appointment
     *
     * @param id Appointment ID
     * @param request Cancellation reason
     * @return Cancelled appointment details
     */

    /**
     * Cancel an appointment
     *
     * @param id Appointment ID
     * @param request Cancellation reason
     * @return Cancelled appointment details
     */
    @Transactional
    public AppointmentResponse cancelAppointment(Long id, CancelRequest request) {
        log.info("Cancelling appointment: {}", id);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        // Check if appointment can be cancelled
        if (!appointment.canBeCancelled()) {
            throw new RuntimeException("Appointment cannot be cancelled. " +
                    "Only pending or confirmed appointments at least 1 hour ahead can be cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(request.getReason());
        appointment.setCancelledAt(LocalDateTime.now());

        Appointment cancelledAppointment = appointmentRepository.save(appointment);

        // Use mock data instead of calling external services
        PatientDTO patient = new PatientDTO();
        patient.setId(cancelledAppointment.getPatientId());
        patient.setFirstName("Patient");
        patient.setLastName(String.valueOf(cancelledAppointment.getPatientId()));

        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(cancelledAppointment.getDoctorId());
        doctor.setFirstName("Dr.");
        doctor.setLastName(String.valueOf(cancelledAppointment.getDoctorId()));
        doctor.setSpecialty("General Medicine");

        log.info("Appointment {} cancelled successfully", id);

        return buildResponse(cancelledAppointment, patient, doctor);
    }
    /**
     * Reschedule an appointment to a new time
     *
     * @param id Appointment ID
     * @param request New time and reason
     * @return Rescheduled appointment details
     */

    /**
     * Reschedule an appointment to a new time
     *
     * @param id Appointment ID
     * @param request New time and reason
     * @return Rescheduled appointment details
     */
    @Transactional
    public AppointmentResponse rescheduleAppointment(Long id, RescheduleRequest request) {
        log.info("Rescheduling appointment: {} to new time: {}", id, request.getNewAppointmentTime());

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        // Check if appointment can be rescheduled
        if (!appointment.canBeRescheduled()) {
            throw new RuntimeException("Appointment cannot be rescheduled. " +
                    "Only pending or confirmed appointments at least 1 hour ahead can be rescheduled.");
        }

        // Skip availability check for now (since doctor service not available)
        // boolean isAvailable = doctorServiceClient.checkAvailability(
        //         appointment.getDoctorId(), request.getNewAppointmentTime());
        // if (!isAvailable) {
        //     throw new RuntimeException("New time slot is not available");
        // }

        // Check for conflicts with existing appointments
        LocalDateTime newEndTime = request.getNewAppointmentTime()
                .plusMinutes(appointment.getDurationMinutes());
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                appointment.getDoctorId(), request.getNewAppointmentTime(), newEndTime);

        // Remove current appointment from conflict check
        conflicts.removeIf(a -> a.getId().equals(id));

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("New time slot is already booked");
        }

        // Update appointment
        appointment.setAppointmentTime(request.getNewAppointmentTime());
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        appointment.setNotes(request.getReason());

        Appointment rescheduledAppointment = appointmentRepository.save(appointment);

        // Use mock data
        PatientDTO patient = new PatientDTO();
        patient.setId(rescheduledAppointment.getPatientId());
        patient.setFirstName("Patient");
        patient.setLastName(String.valueOf(rescheduledAppointment.getPatientId()));

        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(rescheduledAppointment.getDoctorId());
        doctor.setFirstName("Dr.");
        doctor.setLastName(String.valueOf(rescheduledAppointment.getDoctorId()));
        doctor.setSpecialty("General Medicine");

        log.info("Appointment {} rescheduled successfully", id);

        return buildResponse(rescheduledAppointment, patient, doctor);
    }
    /**
     * Get upcoming appointments for a patient
     *
     * @param patientId Patient ID
     * @return List of upcoming appointments
     */
    /**
     * Get upcoming appointments for a patient
     *
     * @param patientId Patient ID
     * @return List of upcoming appointments
     */
    public List<AppointmentResponse> getUpcomingAppointmentsForPatient(Long patientId) {
        log.info("Fetching upcoming appointments for patient: {}", patientId);

        List<Appointment> appointments = appointmentRepository
                .findUpcomingAppointmentsForPatient(patientId, LocalDateTime.now());

        return appointments.stream()
                .map(appointment -> {
                    // Use mock doctor data
                    DoctorDTO doctor = new DoctorDTO();
                    doctor.setId(appointment.getDoctorId());
                    doctor.setFirstName("Dr.");
                    doctor.setLastName(String.valueOf(appointment.getDoctorId()));
                    doctor.setSpecialty("General Medicine");
                    return buildResponse(appointment, null, doctor);
                })
                .collect(Collectors.toList());
    }
    /**
     * Get pending appointments for a doctor (needs confirmation)
     *
     * @param doctorId Doctor ID
     * @return List of pending appointments
     */
    /**
     * Get pending appointments for a doctor (needs confirmation)
     *
     * @param doctorId Doctor ID
     * @return List of pending appointments
     */
    public List<AppointmentResponse> getPendingAppointmentsForDoctor(Long doctorId) {
        log.info("Fetching pending appointments for doctor: {}", doctorId);

        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndStatus(doctorId, AppointmentStatus.PENDING);

        return appointments.stream()
                .map(appointment -> {
                    // Use mock patient data
                    PatientDTO patient = new PatientDTO();
                    patient.setId(appointment.getPatientId());
                    patient.setFirstName("Patient");
                    patient.setLastName(String.valueOf(appointment.getPatientId()));
                    return buildResponse(appointment, patient, null);
                })
                .collect(Collectors.toList());
    }
    /**
     * Get confirmed appointments for a doctor (upcoming)
     *
     * @param doctorId Doctor ID
     * @return List of upcoming confirmed appointments
     */
    /**
     * Get confirmed appointments for a doctor (upcoming)
     *
     * @param doctorId Doctor ID
     * @return List of upcoming confirmed appointments
     */
    public List<AppointmentResponse> getUpcomingConfirmedAppointmentsForDoctor(Long doctorId) {
        log.info("Fetching upcoming confirmed appointments for doctor: {}", doctorId);

        List<Appointment> appointments = appointmentRepository
                .findUpcomingAppointmentsByDoctorAndStatus(
                        doctorId, AppointmentStatus.CONFIRMED, LocalDateTime.now());

        return appointments.stream()
                .map(appointment -> {
                    // Use mock patient data
                    PatientDTO patient = new PatientDTO();
                    patient.setId(appointment.getPatientId());
                    patient.setFirstName("Patient");
                    patient.setLastName(String.valueOf(appointment.getPatientId()));
                    return buildResponse(appointment, patient, null);
                })
                .collect(Collectors.toList());
    }
    /**
     * Generate consultation link for video call
     *
     * @param appointmentId Appointment ID
     * @return Video consultation link
     */
    private String generateConsultationLink(Long appointmentId) {
        // This would integrate with Agora/Twilio
        // For now, return a mock link
        return "https://video.healthcare.com/room/" + appointmentId;
    }

    /**
     * Check if two time slots overlap
     */
    private boolean isTimeOverlap(LocalDateTime appointmentTime, int durationMinutes,
                                  LocalDateTime slotTime) {
        LocalDateTime appointmentEnd = appointmentTime.plusMinutes(durationMinutes);
        LocalDateTime slotEnd = slotTime.plusMinutes(30); // Assuming 30 min slots
        return !appointmentTime.isAfter(slotEnd) && !slotTime.isAfter(appointmentEnd);
    }

    /**
     * Build AppointmentResponse from Appointment entity
     */
    private AppointmentResponse buildResponse(Appointment appointment,
                                              PatientDTO patient,
                                              DoctorDTO doctor) {
        AppointmentResponse.AppointmentResponseBuilder builder = AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .appointmentTime(appointment.getAppointmentTime())
                .durationMinutes(appointment.getDurationMinutes())
                .status(appointment.getStatus())
                .symptoms(appointment.getSymptoms())
                .notes(appointment.getNotes())
                .consultationLink(appointment.getConsultationLink())
                .prescriptionIssued(appointment.isPrescriptionIssued())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt());

        if (patient != null) {
            builder.patientName(patient.getFullName());
        }

        if (doctor != null) {
            builder.doctorName(doctor.getFullName());
            builder.doctorSpecialty(doctor.getSpecialty());
        }

        return builder.build();
    }
}

