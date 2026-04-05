package com.healthcare.doctor_service.repository;

import com.healthcare.doctor_service.model.DigitalPrescription;
import com.healthcare.doctor_service.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<DigitalPrescription, Long> {

    List<DigitalPrescription> findByDoctor(Doctor doctor);

    List<DigitalPrescription> findByPatientId(Long patientId);


    DigitalPrescription findByAppointmentId(Long appointmentId);

    @Query("SELECT p FROM DigitalPrescription p WHERE p.patientId = :patientId " +
            "AND p.status = 'ACTIVE' AND p.validUntil > CURRENT_TIMESTAMP")
    List<DigitalPrescription> findActivePrescriptionsByPatient(@Param("patientId") Long patientId);
}