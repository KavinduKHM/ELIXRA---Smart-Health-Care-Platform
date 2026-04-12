package com.healthcare.appointment_service.service;

import com.healthcare.appointment_service.client.DoctorServiceClient;
import com.healthcare.appointment_service.client.PatientServiceClient;
import com.healthcare.appointment_service.dto.*;
import com.healthcare.appointment_service.model.Appointment;
import com.healthcare.appointment_service.model.AppointmentStatus;
import com.healthcare.appointment_service.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;

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
        log.info("Searching doctors with specialty: {}", request.getSpecialty());

        // ========== TEMPORARY: Return mock doctors instead of calling doctor service ==========

        List<DoctorSearchResponse> mockDoctors = new ArrayList<>();

        // Mock doctors data
        String[] specialties = {"Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology",
                "Ophthalmology", "ENT", "Gastroenterology", "Psychiatry", "General Medicine"};
        String[] names = {"Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", "Dr. Jones",
                "Dr. Garcia", "Dr. Miller", "Dr. Davis", "Dr. Rodriguez", "Dr. Martinez"};

        for (int i = 0; i < specialties.length; i++) {
            // Filter by specialty if provided
            if (request.getSpecialty() != null && !request.getSpecialty().isEmpty()) {
                if (!specialties[i].toLowerCase().contains(request.getSpecialty().toLowerCase())) {
                    continue;
                }
            }

            // Filter by name if provided
            if (request.getDoctorName() != null && !request.getDoctorName().isEmpty()) {
                if (!names[i].toLowerCase().contains(request.getDoctorName().toLowerCase())) {
                    continue;
                }
            }

            DoctorSearchResponse doctor = DoctorSearchResponse.builder()
                    .id((long) (i + 101))
                    .name(names[i])
                    .specialty(specialties[i])
                    .qualification("MD, PhD")
                    .consultationFee(1500.0 + (i * 100))
                    .rating(4.5 - (i * 0.1))
                    .experienceYears(5 + i)
                    .build();

            // If date is provided, add available slots
            if (request.getDate() != null) {
                List<TimeSlotDTO> slots = getAvailableSlots(doctor.getId(), request.getDate().atStartOfDay());
                doctor.setAvailableSlots(slots);
            }

            mockDoctors.add(doctor);
        }

        log.info("Found {} doctors matching criteria", mockDoctors.size());
        return mockDoctors;
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

        // ========== TEMPORARY: Return mock time slots instead of calling doctor service ==========
        // Since doctor service is not available, generate mock time slots for testing

        List<TimeSlotDTO> mockSlots = new ArrayList<>();

        // Generate time slots from 9 AM to 5 PM
        LocalDateTime startTime = date.withHour(9).withMinute(0).withSecond(0);
        LocalDateTime endTime = date.withHour(17).withMinute(0).withSecond(0);

        while (startTime.isBefore(endTime)) {
            TimeSlotDTO slot = new TimeSlotDTO();
            slot.setId((long) mockSlots.size() + 1);
            slot.setDoctorId(doctorId);
            slot.setStartTime(startTime);
            slot.setEndTime(startTime.plusMinutes(30));
            slot.setIsBooked(false);

            // Check if this slot is already booked in appointment service
            boolean isBooked = appointmentRepository.isTimeSlotBooked(doctorId, startTime);
            slot.setIsBooked(isBooked);

            mockSlots.add(slot);
            startTime = startTime.plusMinutes(30);
        }

        log.info("Returning {} mock available slots for doctor {}", mockSlots.size(), doctorId);
        return mockSlots;
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

        // ========== TEMPORARILY COMMENTED OUT - REMOVE WHEN PATIENT/DOCTOR SERVICES ARE READY ==========
        // Step 1: Validate patient exists (call patient service)
        // PatientDTO patient = patientServiceClient.getPatientById(request.getPatientId());
        // if (patient == null) {
        //     throw new RuntimeException("Patient not found with ID: " + request.getPatientId());
        // }

        // Step 2: Validate doctor exists and is available (call doctor service)
        // DoctorDTO doctor = doctorServiceClient.getDoctorById(request.getDoctorId());
        // if (doctor == null) {
        //     throw new RuntimeException("Doctor not found with ID: " + request.getDoctorId());
        // }

        // Step 3: Check if time slot is available
        // boolean isAvailable = doctorServiceClient.checkAvailability(
        //         request.getDoctorId(), request.getAppointmentTime());
        // if (!isAvailable) {
        //     throw new RuntimeException("Doctor is not available at the requested time");
        // }
        // ========== END OF COMMENTED OUT SECTION ==========

        // Create mock patient and doctor for testing
        PatientDTO patient = new PatientDTO();
        patient.setId(request.getPatientId());
        patient.setFirstName("Test");
        patient.setLastName("Patient");

        DoctorDTO doctor = new DoctorDTO();
        doctor.setId(request.getDoctorId());
        doctor.setFirstName("Test");
        doctor.setLastName("Doctor");
        doctor.setSpecialty("General Medicine");

        // Check for conflicts with existing appointments (skip time availability check for now)
        LocalDateTime endTime = request.getAppointmentTime()
                .plusMinutes(request.getDurationMinutes());
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                request.getDoctorId(), request.getAppointmentTime(), endTime);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot is already booked");
        }

        // Create and save appointment
        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .appointmentTime(request.getAppointmentTime())
                .durationMinutes(request.getDurationMinutes())
                .status(AppointmentStatus.PENDING)
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        log.info("Appointment booked successfully with ID: {}", savedAppointment.getId());

        // Build and return response
        return buildResponse(savedAppointment, patient, doctor);
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