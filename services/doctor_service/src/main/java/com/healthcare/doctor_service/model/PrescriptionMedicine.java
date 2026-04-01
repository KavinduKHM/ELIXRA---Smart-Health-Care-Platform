package com.healthcare.doctor_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_medicines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private DigitalPrescription prescription;

    @Column(nullable = false)
    private String medicineName;

    private String dosage;
    private String frequency;
    private String duration;

    @Column(length = 500)
    private String instructions;
}