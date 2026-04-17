package com.healthcare.doctor_service.repository;

import com.healthcare.doctor_service.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Doctor entity
 */
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /**
     * Find doctor by user ID (from auth service)
     */
    Optional<Doctor> findByUserId(Long userId);

    /**
     * Check if user ID already exists.
     */
    boolean existsByUserId(Long userId);

    /**
     * Find doctors by specialty
     */
    List<Doctor> findBySpecialty(String specialty);

    /**
     * Find doctors by status
     */
    List<Doctor> findByStatus(Doctor.DoctorStatus status);

    /**
     * Find verified doctors (active and verified)
     */
    @Query("SELECT d FROM Doctor d WHERE d.status = 'VERIFIED' AND d.active = true")
    List<Doctor> findVerifiedDoctors();

    /**
     * Search doctors by name or specialty (for patient browsing)
     */
    @Query("SELECT d FROM Doctor d WHERE " +
            "d.status = 'VERIFIED' AND d.active = true AND " +
            "(LOWER(d.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(d.specialty) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Doctor> searchDoctors(@Param("search") String search, Pageable pageable);

    /**
     * Check if doctor exists and is verified
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END " +
            "FROM Doctor d WHERE d.id = :doctorId AND d.status = 'VERIFIED' AND d.active = true")
    boolean isDoctorVerified(@Param("doctorId") Long doctorId);
}