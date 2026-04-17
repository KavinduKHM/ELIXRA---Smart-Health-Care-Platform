package com.healthcare.ai_symptom_checker.controller;

import com.healthcare.ai_symptom_checker.client.AppointmentServiceClient;
import com.healthcare.ai_symptom_checker.dto.DoctorSearchResponse;
import com.healthcare.ai_symptom_checker.dto.SymptomCheckRequest;
import com.healthcare.ai_symptom_checker.dto.SymptomCheckResponse;
import com.healthcare.ai_symptom_checker.service.GeminiAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/symptom-checker")
@RequiredArgsConstructor
@Slf4j
public class SymptomCheckerController {

    private final GeminiAiService geminiAiService;
    private final AppointmentServiceClient appointmentServiceClient;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeSymptoms(@Valid @RequestBody SymptomCheckRequest request) {
        log.info("Received symptom analysis request (len={} chars)", request.getSymptoms() == null ? 0 : request.getSymptoms().length());

        // Step 1: Get AI analysis
        SymptomCheckResponse analysis = geminiAiService.analyzeSymptoms(request.getSymptoms());

        // Step 2: Call Appointment Service to fetch doctors by recommended specialty
        List<DoctorSearchResponse> doctors = List.of();
        String specialty = analysis == null ? null : analysis.getRecommendedSpecialty();
        if (specialty != null && !specialty.isBlank()) {
            try {
                doctors = appointmentServiceClient.searchDoctors(specialty);
            } catch (Exception ex) {
                log.warn("Doctor lookup failed for specialty '{}': {}", specialty, ex.getMessage());
                doctors = List.of();
            }
        }

        // Step 3: Combine response
        Map<String, Object> response = new HashMap<>();
        response.put("analysis", analysis);
        response.put("recommendedDoctors", doctors);
        response.put("disclaimer", analysis.getDisclaimer());

        return ResponseEntity.ok(response);
    }
}