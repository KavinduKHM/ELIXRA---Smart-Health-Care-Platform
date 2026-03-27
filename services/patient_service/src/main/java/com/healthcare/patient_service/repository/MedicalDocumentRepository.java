package com.healthcare.patient_service.repository;

import com.healthcare.patient_service.model.MedicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalDocumentRepository extends JpaRepository<MedicalDocument, Long> {
    
    /**
     * Find all documents by patient ID
     */
    List<MedicalDocument> findByPatientId(Long patientId);
    
    /**
     * Find document by ID and patient ID (for ownership validation)
     */
    Optional<MedicalDocument> findByIdAndPatientId(Long id, Long patientId);
    
    /**
     * Delete document by ID and patient ID (for ownership validation)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM MedicalDocument d WHERE d.id = :documentId AND d.patient.id = :patientId")
    int deleteByIdAndPatientId(@Param("documentId") Long documentId, @Param("patientId") Long patientId);
    
    /**
     * Delete all documents for a patient
     */
    @Modifying
    @Transactional
    void deleteByPatientId(Long patientId);
}