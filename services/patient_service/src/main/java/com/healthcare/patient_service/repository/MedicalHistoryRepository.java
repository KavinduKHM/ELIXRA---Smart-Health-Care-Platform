package com.healthcare.patient_service.repository;

import com.healthcare.patient_service.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    
    List<MedicalHistory> findByPatientId(Long patientId);
    
    List<MedicalHistory> findByPatientIdOrderByEventDateDesc(Long patientId);
    
    List<MedicalHistory> findByPatientIdAndHistoryType(Long patientId, String historyType);
    
    Optional<MedicalHistory> findByIdAndPatientId(Long id, Long patientId);
    
    @Modifying
    @Transactional
    void deleteByPatientId(Long patientId);
    
    boolean existsByPatientId(Long patientId);
    
    boolean existsByPatientIdAndHistoryType(Long patientId, String historyType);
}