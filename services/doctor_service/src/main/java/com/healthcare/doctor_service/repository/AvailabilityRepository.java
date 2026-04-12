package com.healthcare.doctor_service.repository;

import com.healthcare.doctor_service.model.Availability;
import com.healthcare.doctor_service.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Availability entity
 */
@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    /**
     * Find all availabilities for a specific doctor
     */
    List<Availability> findByDoctor(Doctor doctor);

    /**
     * Find availabilities for a doctor on a specific date
     */
    List<Availability> findByDoctorAndAvailableDate(Doctor doctor, LocalDate date);

    /**
     * Find available slots for a doctor on a specific date
     */
    @Query("SELECT a FROM Availability a WHERE a.doctor = :doctor " +
            "AND a.availableDate = :date AND a.status = 'AVAILABLE'")
    List<Availability> findAvailableSlots(@Param("doctor") Doctor doctor,
                                          @Param("date") LocalDate date);

    /**
     * Check if a doctor has any availability on a given date
     */
    boolean existsByDoctorAndAvailableDate(Doctor doctor, LocalDate date);

    /**
     * Delete all availabilities for a doctor on a specific date
     */
    @Modifying
    @Query("DELETE FROM Availability a WHERE a.doctor = :doctor AND a.availableDate = :date")
    void deleteByDoctorAndAvailableDate(@Param("doctor") Doctor doctor,
                                        @Param("date") LocalDate date);
}