package com.healthcare.patient_service.exception;

/**
 * Exception thrown when a patient is not found in the database
 */
public class PatientNotFoundException extends RuntimeException {
    
    public PatientNotFoundException(String message) {
        super(message);
    }
    
    public PatientNotFoundException(Long patientId) {
        super("Patient not found with ID: " + patientId);
    }
    
    public PatientNotFoundException(String field, String value) {
        super("Patient not found with " + field + ": " + value);
    }
}