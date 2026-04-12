package com.healthcare.doctor_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data                           // Generates getters, setters, toString, equals, hashCode
@Builder                        // Generates builder pattern
@NoArgsConstructor              // Generates no-arg constructor
@AllArgsConstructor             // Generates all-args constructor
@EntityListeners(AuditingEntityListener.class)
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String email;
    private String phoneNumber;
    private String profilePicture;

    @Column(nullable = false)
    private String specialty;

    private String qualification;
    private Integer experienceYears;

    @Column(length = 1000)
    private String bio;

    private Double consultationFee;
    private Integer averageConsultationDuration;

    @Enumerated(EnumType.STRING)
    private DoctorStatus status = DoctorStatus.PENDING;

    private boolean active = true;

    private Double averageRating = 0.0;
    private Integer totalReviews = 0;
    private Integer totalPatients = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude  // Prevent circular reference in toString
    @EqualsAndHashCode.Exclude
    private List<Availability> availabilities = new ArrayList<>();

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DigitalPrescription> prescriptions = new ArrayList<>();

    public enum DoctorStatus {
        PENDING,
        VERIFIED,
        SUSPENDED
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}