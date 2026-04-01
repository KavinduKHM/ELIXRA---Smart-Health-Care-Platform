package com.healthcare.doctor_service.service;

import com.healthcare.doctor_service.dto.*;
import com.healthcare.doctor_service.model.*;
import com.healthcare.doctor_service.repository.AvailabilityRepository;
import com.healthcare.doctor_service.repository.DoctorRepository;
import com.healthcare.doctor_service.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // <-- IMPORTANT: Add this for logger
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j  // <-- IMPORTANT: This annotation creates the log variable
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PrescriptionRepository prescriptionRepository;

    // ==================== Doctor Profile Management ====================

    @Transactional
    public DoctorDTO registerDoctor(DoctorRegistrationRequest request) {
        log.info("Registering new doctor for user ID: {}", request.getUserId());

        if (doctorRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new RuntimeException("Doctor profile already exists for this user");
        }

        Doctor doctor = Doctor.builder()
                .userId(request.getUserId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .specialty(request.getSpecialty())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .bio(request.getBio())
                .consultationFee(request.getConsultationFee())
                .averageConsultationDuration(request.getAverageConsultationDuration())
                .status(Doctor.DoctorStatus.PENDING)
                .active(true)
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);
        log.info("Doctor registered successfully with ID: {}", savedDoctor.getId());

        return DoctorDTO.fromEntity(savedDoctor);
    }

    public DoctorDTO getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));
        return DoctorDTO.fromEntity(doctor);
    }

    public DoctorDTO getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found for user ID: " + userId));
        return DoctorDTO.fromEntity(doctor);
    }

    @Transactional
    public DoctorDTO updateProfile(Long doctorId, DoctorRegistrationRequest request) {
        log.info("Updating profile for doctor ID: {}", doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setAverageConsultationDuration(request.getAverageConsultationDuration());

        Doctor updatedDoctor = doctorRepository.save(doctor);
        log.info("Doctor profile updated successfully");

        return DoctorDTO.fromEntity(updatedDoctor);
    }

    public Page<DoctorDTO> searchDoctors(String search, Pageable pageable) {
        return doctorRepository.searchDoctors(search, pageable)
                .map(DoctorDTO::fromEntity);
    }

    public List<DoctorDTO> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty).stream()
                .map(DoctorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getVerifiedDoctors() {
        return doctorRepository.findVerifiedDoctors().stream()
                .map(DoctorDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDTO verifyDoctor(Long doctorId) {
        log.info("Verifying doctor ID: {}", doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setStatus(Doctor.DoctorStatus.VERIFIED);
        Doctor verifiedDoctor = doctorRepository.save(doctor);

        log.info("Doctor verified successfully");

        return DoctorDTO.fromEntity(verifiedDoctor);
    }

    @Transactional
    public DoctorDTO suspendDoctor(Long doctorId) {
        log.info("Suspending doctor ID: {}", doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        doctor.setStatus(Doctor.DoctorStatus.SUSPENDED);
        doctor.setActive(false);
        Doctor suspendedDoctor = doctorRepository.save(doctor);

        log.info("Doctor suspended successfully");

        return DoctorDTO.fromEntity(suspendedDoctor);
    }

    // ==================== Availability Management ====================

    @Transactional
    public AvailabilityDTO setAvailability(Long doctorId, AvailabilityRequest request) {
        log.info("Setting availability for doctor ID: {} on date: {}", doctorId, request.getDate());

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        if (availabilityRepository.existsByDoctorAndAvailableDate(doctor, request.getDate())) {
            availabilityRepository.deleteByDoctorAndAvailableDate(doctor, request.getDate());
        }

        Availability availability = Availability.builder()
                .doctor(doctor)
                .availableDate(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .slotDuration(request.getSlotDuration())
                .status(Availability.AvailabilityStatus.AVAILABLE)
                .build();

        Availability savedAvailability = availabilityRepository.save(availability);
        log.info("Availability set successfully");

        return AvailabilityDTO.fromEntity(savedAvailability);
    }

    public List<AvailabilityDTO> getDoctorAvailabilities(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        return availabilityRepository.findByDoctor(doctor).stream()
                .map(AvailabilityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AvailabilityDTO> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        return availabilityRepository.findAvailableSlots(doctor, date).stream()
                .map(AvailabilityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAvailability(Long doctorId, Long availabilityId) {
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        if (!availability.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Availability does not belong to this doctor");
        }

        availabilityRepository.delete(availability);
        log.info("Availability deleted successfully");
    }

    // ==================== Prescription Management ====================

    @Transactional
    public PrescriptionDTO issuePrescription(Long doctorId, PrescriptionRequest request) {
        log.info("Issuing prescription for patient: {} by doctor: {}", request.getPatientId(), doctorId);

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        if (doctor.getStatus() != Doctor.DoctorStatus.VERIFIED) {
            throw new RuntimeException("Doctor must be verified to issue prescriptions");
        }

        DigitalPrescription prescription = DigitalPrescription.builder()
                .doctor(doctor)
                .patientId(request.getPatientId())
                .appointmentId(request.getAppointmentId())
                .diagnosis(request.getDiagnosis())
                .notes(request.getNotes())
                .validUntil(request.getValidUntil())
                .status(DigitalPrescription.PrescriptionStatus.ACTIVE)
                .build();

        DigitalPrescription savedPrescription = prescriptionRepository.save(prescription);

        // Be defensive: even though the entity declares a default list, Lombok's @Builder will
        // set it to null unless the field is annotated with @Builder.Default.
        if (savedPrescription.getMedicines() == null) {
            savedPrescription.setMedicines(new ArrayList<>());
        }

        List<PrescriptionRequest.MedicineRequest> medicines =
                request.getMedicines() != null ? request.getMedicines() : Collections.emptyList();

        for (PrescriptionRequest.MedicineRequest medRequest : medicines) {
            PrescriptionMedicine medicine = PrescriptionMedicine.builder()
                    .prescription(savedPrescription)
                    .medicineName(medRequest.getMedicineName())
                    .dosage(medRequest.getDosage())
                    .frequency(medRequest.getFrequency())
                    .duration(medRequest.getDuration())
                    .instructions(medRequest.getInstructions())
                    .build();

            savedPrescription.getMedicines().add(medicine);
        }

        DigitalPrescription finalPrescription = prescriptionRepository.save(savedPrescription);
        log.info("Prescription issued successfully with ID: {}", finalPrescription.getId());

        return PrescriptionDTO.fromEntity(finalPrescription);
    }

    public List<PrescriptionDTO> getDoctorPrescriptions(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + doctorId));

        return prescriptionRepository.findByDoctor(doctor).stream()
                .map(PrescriptionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long prescriptionId) {
        DigitalPrescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found with ID: " + prescriptionId));

        return PrescriptionDTO.fromEntity(prescription);
    }
}