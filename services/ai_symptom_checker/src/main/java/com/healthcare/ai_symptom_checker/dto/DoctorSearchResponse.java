package com.healthcare.ai_symptom_checker.dto;

import lombok.Data;

@Data
public class DoctorSearchResponse {
    private Long id;
    private String name;
    private String specialty;
}