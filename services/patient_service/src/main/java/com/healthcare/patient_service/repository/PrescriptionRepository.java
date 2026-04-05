package com.healthcare.patient_service.repository;

import com.healthcare.patient_service.model.Patient;
import com.healthcare.patient_service.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Prescription Repository - Database operations for Prescription entity
 */
@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    /**
     * Find all prescriptions for a patient
     */
    List<Prescription> findByPatient(Patient patient);
    
    /**
     * Find prescriptions by patient ID
     */
    List<Prescription> findByPatientId(Long patientId);
    
    /**
     * Find prescriptions by doctor ID
     */
    List<Prescription> findByDoctorId(Long doctorId);
    
    /**
     * Find prescriptions by patient ID and active status
     */
    List<Prescription> findByPatientIdAndIsActiveTrue(Long patientId);
    
    /**
     * Find prescriptions for a patient between dates
     */
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId " +
           "AND p.prescriptionDate BETWEEN :startDate AND :endDate")
    List<Prescription> findByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find prescription by appointment ID (used for idempotent upsert).
     */
    Optional<Prescription> findByAppointmentId(Long appointmentId);

    /**
     * Find prescriptions by patient ID ordered by prescription date descending
     */
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
}