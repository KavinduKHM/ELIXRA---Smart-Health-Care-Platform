package com.healthcare.patient_service.exception;

/**
 * Exception thrown when document upload fails
 */
public class DocumentUploadException extends RuntimeException {
    
    public DocumentUploadException(String message) {
        super(message);
    }
    
    public DocumentUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}