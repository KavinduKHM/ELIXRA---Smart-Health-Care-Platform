package com.healthcare.ai_symptom_checker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SymptomCheckRequest {
    @NotBlank(message = "Symptoms cannot be empty")
    private String symptoms;
}