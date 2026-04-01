package com.healthcare.appointment_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Appointment entity - Represents a booked appointment between patient and doctor.
 *
 * @Entity - JPA entity mapped to database table
 * @Table - Specifies table name and unique constraints
 * @Data - Lombok generates getters, setters, toString, equals, hashCode
 * @Builder - Builder pattern for object creation
 * @NoArgsConstructor - Required by JPA
 * @AllArgsConstructor - Constructor with all fields
 * @EntityListeners - Enables automatic timestamp management
 */
@Entity
@Table(name = "appointments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "appointment_time"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 30;  // Default 30 minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    private String symptoms;
    private String notes;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "consultation_link")
    private String consultationLink;  // Video call link

    @Column(name = "prescription_issued")
    private boolean prescriptionIssued = false;

    // Timestamps - automatically managed
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Convenience method to check if appointment can be cancelled
     * Can cancel if appointment is in PENDING or CONFIRMED state
     * and appointment time is at least 1 hour away
     */
    public boolean canBeCancelled() {
        if (status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED) {
            return LocalDateTime.now().plusHours(1).isBefore(appointmentTime);
        }
        return false;
    }

    /**
     * Convenience method to check if appointment can be rescheduled
     */
    public boolean canBeRescheduled() {
        return (status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED)
                && LocalDateTime.now().plusHours(1).isBefore(appointmentTime);
    }
}