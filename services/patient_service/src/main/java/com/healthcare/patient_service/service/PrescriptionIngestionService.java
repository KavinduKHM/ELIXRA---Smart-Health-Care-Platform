package com.healthcare.patient_service.service;

import com.healthcare.patient_service.dto.PrescriptionUpsertRequest;
import com.healthcare.patient_service.exception.PatientNotFoundException;
import com.healthcare.patient_service.model.Patient;
import com.healthcare.patient_service.model.Prescription;
import com.healthcare.patient_service.model.PrescriptionMedication;
import com.healthcare.patient_service.repository.PatientRepository;
import com.healthcare.patient_service.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class PrescriptionIngestionService {

    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;

    /**
     * Create or update prescription in patient DB.
     *
     * Idempotency: we use appointmentId as a natural key (one prescription per appointment).
     */
    @Transactional
    public void upsertPrescription(PrescriptionUpsertRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(req.getPatientId()));

        Prescription prescription = prescriptionRepository.findByAppointmentId(req.getAppointmentId())
                .orElseGet(Prescription::new);

        prescription.setPatient(patient);
        prescription.setDoctorId(req.getDoctorId());
        prescription.setDoctorName(req.getDoctorName());
        prescription.setDoctorSpecialty(req.getDoctorSpecialty());
        prescription.setAppointmentId(req.getAppointmentId());
        prescription.setPrescriptionDate(req.getPrescriptionDate());
        prescription.setValidUntil(req.getValidUntil());
        prescription.setDiagnosis(req.getDiagnosis());
        prescription.setNotes(req.getNotes());
        prescription.setActive(req.isActive());
        prescription.setFulfilled(req.isFulfilled());

        // Replace medications list (simple, safe for upsert)
        if (prescription.getMedications() == null) {
            prescription.setMedications(new ArrayList<>());
        } else {
            prescription.getMedications().clear();
        }

        if (req.getMedications() != null) {
            for (PrescriptionUpsertRequest.Medication m : req.getMedications()) {
                PrescriptionMedication pm = PrescriptionMedication.builder()
                        .prescription(prescription)
                        .medicationName(m.getMedicationName())
                        .dosage(m.getDosage())
                        .frequency(m.getFrequency())
                        .duration(m.getDuration())
                        .timing(m.getTiming())
                        .instructions(m.getInstructions())
                        .quantity(m.getQuantity())
                        .refillInfo(m.getRefillInfo())
                        .build();

                prescription.getMedications().add(pm);
            }
        }

        prescriptionRepository.save(prescription);
    }
}

