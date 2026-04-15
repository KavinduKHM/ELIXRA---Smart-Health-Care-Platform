package com.healthcare.doctor_service.dto;

import com.healthcare.doctor_service.model.DigitalPrescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private Long appointmentId;
    private String diagnosis;
    private String notes;
    private List<MedicineDTO> medicines;
    private LocalDateTime validUntil;
    private LocalDateTime issuedAt;
    private DigitalPrescription.PrescriptionStatus status;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineDTO {
        private String medicineName;
        private String dosage;
        private String frequency;
        private String duration;
        private String instructions;
    }

    /**
     * Convert Prescription entity to DTO
     */
    public static PrescriptionDTO fromEntity(DigitalPrescription prescription) {
        if (prescription == null) {
            return null;
        }

        return PrescriptionDTO.builder()
                .id(prescription.getId())
                .doctorId(prescription.getDoctor() != null ? prescription.getDoctor().getId() : null)
                .doctorName(prescription.getDoctor() != null ? prescription.getDoctor().getFullName() : null)
                .patientId(prescription.getPatientId())
                .appointmentId(prescription.getAppointmentId())
                .diagnosis(prescription.getDiagnosis())
                .notes(prescription.getNotes())
                .medicines(prescription.getMedicines() != null ?
                        prescription.getMedicines().stream()
                                .map(m -> MedicineDTO.builder()
                                        .medicineName(m.getMedicineName())
                                        .dosage(m.getDosage())
                                        .frequency(m.getFrequency())
                                        .duration(m.getDuration())
                                        .instructions(m.getInstructions())
                                        .build())
                                .collect(Collectors.toList()) : Collections.emptyList())
                .validUntil(prescription.getValidUntil())
                .issuedAt(prescription.getIssuedAt())
                .status(prescription.getStatus())
                .build();
    }
}