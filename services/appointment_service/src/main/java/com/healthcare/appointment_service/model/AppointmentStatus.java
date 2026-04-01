package com.healthcare.appointment_service.model;

/**
 * Enum representing the possible states of an appointment.
 *
 * PENDING - Waiting for doctor confirmation
 * CONFIRMED - Doctor has accepted the appointment
 * CANCELLED - Appointment was cancelled
 * COMPLETED - Consultation finished
 * RESCHEDULED - Appointment time changed
 */
public enum AppointmentStatus {
    PENDING,      // Initial state after booking
    CONFIRMED,    // Doctor accepted
    CANCELLED,    // Cancelled by patient or doctor
    COMPLETED,    // Consultation completed
    RESCHEDULED   // Time changed
}