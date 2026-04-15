package com.healthcare.appointment_service.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for searching doctors by specialty with filters.
 */
@Data
public class SearchRequest {
    private String specialty;
    private String doctorName;
    private LocalDate date;
    private Integer page = 0;
    private Integer size = 20;
}