package com.healthcare.ai_symptom_checker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomCheckResponse {
    private String analysis;
    private String possibleConditions;
    private String recommendedSpecialty;
    private String urgencyLevel;
    private String disclaimer;
}