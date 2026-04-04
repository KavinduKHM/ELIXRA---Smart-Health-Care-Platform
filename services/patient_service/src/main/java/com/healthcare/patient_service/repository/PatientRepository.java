package com.healthcare.patient_service.repository;

import com.healthcare.patient_service.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    // ==================== BASIC QUERIES ====================
    
    Optional<Patient> findByUserId(Long userId);
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByPhoneNumber(String phoneNumber);
    
    // ==================== EXISTENCE CHECKS ====================
    
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByUserId(Long userId);
    
    // ==================== SEARCH QUERIES ====================
    
    @Query("SELECT p FROM Patient p WHERE LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Patient> searchByName(@Param("name") String name);
    
    List<Patient> findByEmailContainingIgnoreCase(String email);
    List<Patient> findByPhoneNumberContaining(String phoneNumber);
    
    // ==================== FILTER QUERIES ====================
    
    List<Patient> findByActive(boolean active);
    List<Patient> findByGender(String gender);
    List<Patient> findByBloodGroup(String bloodGroup);
    List<Patient> findByCity(String city);
    
    // ==================== ORDERED QUERIES ====================
    
    List<Patient> findAllByOrderByCreatedAtDesc();
    List<Patient> findAllByOrderByLastNameAsc();
    List<Patient> findAllByOrderByFirstNameAsc();
    
    // ==================== COUNT QUERIES ====================
    
    long countByActive(boolean active);
    long countByGender(String gender);
    long countByBloodGroup(String bloodGroup);
    long countByCity(String city);
}