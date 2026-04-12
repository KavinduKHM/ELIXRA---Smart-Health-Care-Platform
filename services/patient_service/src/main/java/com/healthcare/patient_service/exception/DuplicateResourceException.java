package com.healthcare.patient_service.exception;

/**
 * Exception thrown when trying to create a resource that already exists
 */
public class DuplicateResourceException extends RuntimeException {
    
    public DuplicateResourceException(String message) {
        super(message);
    }
    
    // Constructor with two arguments (resource and value)
    public DuplicateResourceException(String resource, String value) {
        super(resource + " already exists: " + value);
    }
    
    // Constructor with three arguments (resource, field, value)
    public DuplicateResourceException(String resource, String field, String value) {
        super(resource + " already exists with " + field + ": " + value);
    }
}