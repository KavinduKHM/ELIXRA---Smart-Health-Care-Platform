package com.healthcare.patient_service.repository;

import com.healthcare.patient_service.model.MedicalHistory;
import com.healthcare.patient_service.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Medical History Repository - Handles database operations for medical history
 */
@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    
    //  BASIC QUERIES
    
    /**
     * Find all medical history records for a patient
     */
    List<MedicalHistory> findByPatient(Patient patient);
    
    /**
     * Find all medical history records by patient ID
     */
    List<MedicalHistory> findByPatientId(Long patientId);
    
    /**
     * Find medical history by patient ID, ordered by event date (most recent first)
     */
    List<MedicalHistory> findByPatientIdOrderByEventDateDesc(Long patientId);
    
    /**
     * Find medical history by patient ID, ordered by creation date
     */
    List<MedicalHistory> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    /**
     * Find medical history record by ID and patient ID (for ownership validation)
     */
    Optional<MedicalHistory> findByIdAndPatientId(Long id, Long patientId);
    
    
    //  QUERIES BY HISTORY TYPE
    
    /**
     * Find medical history by patient ID and history type
     * Examples: DIAGNOSIS, SURGERY, VACCINATION, HOSPITALIZATION, ALLERGY, FAMILY_HISTORY
     */
    List<MedicalHistory> findByPatientIdAndHistoryType(Long patientId, String historyType);
    
    /**
     * Find medical history by patient ID and multiple history types
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.historyType IN :historyTypes")
    List<MedicalHistory> findByPatientIdAndHistoryTypes(
            @Param("patientId") Long patientId,
            @Param("historyTypes") List<String> historyTypes);
    
    
    //  QUERIES BY STATUS 
    
    /**
     * Find medical history by patient ID and status
     * Status values: ACTIVE, RESOLVED, ONGOING
     */
    List<MedicalHistory> findByPatientIdAndStatus(Long patientId, String status);
    
    /**
     * Find active medical conditions (status = ACTIVE or ONGOING)
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.status IN ('ACTIVE', 'ONGOING')")
    List<MedicalHistory> findActiveConditionsByPatientId(@Param("patientId") Long patientId);
    
    
    //  DATE RANGE QUERIES 
    /**
     * Find medical history by patient ID and date range
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.eventDate BETWEEN :startDate AND :endDate")
    List<MedicalHistory> findByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find medical history from a specific date onward
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.eventDate >= :fromDate")
    List<MedicalHistory> findByPatientIdFromDate(
            @Param("patientId") Long patientId,
            @Param("fromDate") LocalDateTime fromDate);
    
    
    // DOCTOR AND FACILITY QUERIES
    
    /**
     * Find medical history by patient ID and doctor name (partial match)
     */
    List<MedicalHistory> findByPatientIdAndDoctorNameContainingIgnoreCase(
            @Param("patientId") Long patientId,
            @Param("doctorName") String doctorName);
    
    /**
     * Find medical history by patient ID and facility name (partial match)
     */
    List<MedicalHistory> findByPatientIdAndFacilityNameContainingIgnoreCase(
            @Param("patientId") Long patientId,
            @Param("facilityName") String facilityName);
    
    
    //  AGGREGATION QUERIES
    
    /**
     * Count medical history records by history type for a patient
     * Returns list of Object arrays: [historyType, count]
     */
    @Query("SELECT h.historyType, COUNT(h) FROM MedicalHistory h " +
           "WHERE h.patient.id = :patientId GROUP BY h.historyType")
    List<Object[]> countByHistoryType(@Param("patientId") Long patientId);
    
    /**
     * Get latest medical history record by type
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND h.historyType = :historyType ORDER BY h.eventDate DESC LIMIT 1")
    Optional<MedicalHistory> findLatestByPatientIdAndHistoryType(
            @Param("patientId") Long patientId,
            @Param("historyType") String historyType);
    
    
    // UPDATE QUERIES 
    
    /**
     * Update status of a medical history record
     */
    @Modifying
    @Transactional
    @Query("UPDATE MedicalHistory h SET h.status = :status WHERE h.id = :historyId")
    void updateStatus(@Param("historyId") Long historyId, @Param("status") String status);
    
    /**
     * Delete all medical history for a patient
     */
    @Modifying
    @Transactional
    void deleteByPatientId(Long patientId);
    
    
    //  SEARCH QUERIES 
    
    /**
     * Search medical history by title or description (full-text search)
     */
    @Query("SELECT h FROM MedicalHistory h WHERE h.patient.id = :patientId " +
           "AND (LOWER(h.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(h.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<MedicalHistory> searchByTitleOrDescription(
            @Param("patientId") Long patientId,
            @Param("searchTerm") String searchTerm);
    
    
    //  EXISTENCE CHECKS
    
    /**
     * Check if patient has any medical history
     */
    boolean existsByPatientId(Long patientId);
    
    /**
     * Check if patient has medical history of specific type
     */
    boolean existsByPatientIdAndHistoryType(Long patientId, String historyType);
}