package com.healthcare.appointment_service.repository;

import com.healthcare.appointment_service.model.Appointment;
import com.healthcare.appointment_service.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Appointment entity.
 * Extends JpaRepository which provides basic CRUD operations.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // ========== Basic Queries ==========

    /**
     * Find appointment by ID (already provided by JpaRepository)
     */

    /**
     * Find all appointments for a specific patient
     */
    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(Long patientId);

    /**
     * Find all appointments for a specific doctor
     */
    List<Appointment> findByDoctorIdOrderByAppointmentTimeDesc(Long doctorId);

    /**
     * Find appointments for a patient with pagination
     */
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    /**
     * Find appointments for a doctor with pagination
     */
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    // ========== Status-based Queries ==========

    /**
     * Find appointments by status
     */
    List<Appointment> findByStatus(AppointmentStatus status);

    /**
     * Find pending appointments for a doctor
     */
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    /**
     * Find confirmed appointments for a doctor
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.status = :status " +
            "AND a.appointmentTime > :now ORDER BY a.appointmentTime ASC")
    List<Appointment> findUpcomingAppointmentsByDoctorAndStatus(
            @Param("doctorId") Long doctorId,
            @Param("status") AppointmentStatus status,
            @Param("now") LocalDateTime now);

    // ========== Time-based Queries ==========

    /**
     * Find appointments in a specific time range for a doctor
     * Used to check for scheduling conflicts
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND a.appointmentTime BETWEEN :startTime AND :endTime " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * Find appointments for a doctor on a specific date
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND DATE(a.appointmentTime) = DATE(:date) " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    List<Appointment> findAppointmentsByDoctorAndDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDateTime date);

    /**
     * Find upcoming appointments for a patient
     */
    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId " +
            "AND a.appointmentTime > :now " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED') " +
            "ORDER BY a.appointmentTime ASC")
    List<Appointment> findUpcomingAppointmentsForPatient(
            @Param("patientId") Long patientId,
            @Param("now") LocalDateTime now);

    // ========== Count Queries ==========

    /**
     * Count appointments for a doctor on a specific date
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND DATE(a.appointmentTime) = DATE(:date) " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    long countAppointmentsByDoctorAndDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDateTime date);

    /**
     * Check if a time slot is available for a doctor
     */
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctorId = :doctorId " +
            "AND a.appointmentTime = :time " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    boolean isTimeSlotBooked(
            @Param("doctorId") Long doctorId,
            @Param("time") LocalDateTime time);

    // ========== Update Queries ==========

    /**
     * Update appointment status
     */
    @Query("UPDATE Appointment a SET a.status = :status, a.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE a.id = :appointmentId")
    void updateStatus(@Param("appointmentId") Long appointmentId,
                      @Param("status") AppointmentStatus status);
}