package com.healthcare.appointment_service.model;

public enum AppointmentStatus {
    PENDING,            // Waiting for doctor confirmation (original status)
    PENDING_PAYMENT,    // Awaiting payment
    CONFIRMED,
    CANCELLED,
    COMPLETED,
    RESCHEDULED
}