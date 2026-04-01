package com.healthcare.doctor_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DigitalPrescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Doctor doctor;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long appointmentId;

    @Column(length = 1000)
    private String diagnosis;

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<PrescriptionMedicine> medicines = new ArrayList<>();

    private LocalDateTime validUntil;

    @CreatedDate
    private LocalDateTime issuedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PrescriptionStatus status = PrescriptionStatus.ACTIVE;

    public enum PrescriptionStatus {
        ACTIVE,
        EXPIRED,
        CANCELLED
    }
}