package com.healthcare.ai_symptom_checker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.ai_symptom_checker.dto.SymptomCheckResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public class GeminiAiService {

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    /**
     * Can be configured as either "gemini-1.5-flash" or "models/gemini-1.5-flash".
     */
    @Value("${ai.gemini.model}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SymptomCheckResponse analyzeSymptoms(String symptomsText) {
        log.info("Analyzing symptoms (len={} chars)", symptomsText == null ? 0 : symptomsText.length());

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured. Returning fallback analysis.");
            return fallbackResponse("Gemini API key is not configured on the server");
        }
        if (modelName == null || modelName.isBlank()) {
            log.warn("Gemini model name not configured. Returning fallback analysis.");
            return fallbackResponse("Gemini model name is not configured on the server");
        }

        String prompt = buildPrompt(symptomsText);

        try {
            String configuredModel = normalizeModelName(modelName);

            // Candidate models (configured first, then discovered ones)
            Set<String> candidates = new LinkedHashSet<>();
            candidates.add(configuredModel);

            // We'll discover models lazily only when needed; this avoids an extra network call on success.

            RestClientResponseException lastHttp = null;
            RuntimeException lastOther = null;

            for (String model : new ArrayList<>(candidates)) {
                try {
                    return callGenerateContentWithRetry(model, prompt);
                } catch (RestClientResponseException e) {
                    lastHttp = e;

                    // Model not found / not allowed -> discover and try other models.
                    if (e.getRawStatusCode() == 404 || e.getRawStatusCode() == 403) {
                        log.warn("Gemini model {} not usable (status {}). Discovering supported models...", model, e.getRawStatusCode());
                        for (String discovered : discoverGenerateContentModels()) {
                            candidates.add(discovered);
                        }
                        // continue loop; candidates list will be extended below
                    } else if (e.getRawStatusCode() == 503) {
                        // 503 handled inside retry method; if we still got here, try other models.
                        log.warn("Gemini model {} still unavailable after retries (503). Trying other models...", model);
                        for (String discovered : discoverGenerateContentModels()) {
                            candidates.add(discovered);
                        }
                    } else {
                        // Other HTTP errors (401, 429, 400 etc.) -> fail fast, since retrying other models won't help.
                        log.error("Gemini call failed with non-recoverable HTTP status {}", e.getRawStatusCode(), e);
                        throw new RuntimeException("AI analysis failed: Gemini returned HTTP " + e.getRawStatusCode(), e);
                    }
                } catch (RuntimeException e) {
                    lastOther = e;
                }

                // if discover added more, iterate them
                if (candidates.size() > 1) {
                    // continue; loop over all candidates in insertion order
                    // Rebuild list to avoid ConcurrentModification
                    for (String discovered : candidates) {
                        if (discovered.equals(model)) continue;
                        try {
                            return callGenerateContentWithRetry(discovered, prompt);
                        } catch (RestClientResponseException e) {
                            lastHttp = e;
                            if (e.getRawStatusCode() == 503) {
                                log.warn("Gemini model {} unavailable (503) after retries.", discovered);
                                continue;
                            }
                            if (e.getRawStatusCode() == 404 || e.getRawStatusCode() == 403) {
                                log.warn("Gemini model {} not usable (status {}).", discovered, e.getRawStatusCode());
                                continue;
                            }
                            throw new RuntimeException("AI analysis failed: Gemini returned HTTP " + e.getRawStatusCode(), e);
                        }
                    }
                    break;
                }
            }

            if (lastHttp != null) {
                throw new RuntimeException("AI analysis failed: Gemini error (" + lastHttp.getRawStatusCode() + ")", lastHttp);
            }
            if (lastOther != null) {
                throw lastOther;
            }
            throw new RuntimeException("AI analysis failed: unknown error");

        } catch (Exception ex) {
            log.warn("AI analysis failed. Returning fallback analysis. reason={}", ex.getMessage());
            return fallbackResponse("AI analysis is currently unavailable");
        }
    }

    private SymptomCheckResponse fallbackResponse(String reason) {
        String analysisText = "AI symptom analysis is currently unavailable. " + (reason == null ? "" : reason) + ".\n" +
                "To enable it, set GEMINI_API_KEY (and optionally GEMINI_MODEL) for the ai-symptom-checker service and restart it.";

        return SymptomCheckResponse.builder()
                .analysis(analysisText)
                .possibleConditions("")
                .recommendedSpecialty("General Medicine")
                .urgencyLevel("Routine")
                .disclaimer("This is an AI-generated preliminary analysis and is not a substitute for professional medical advice.")
                .build();
    }

    private SymptomCheckResponse callGenerateContentWithRetry(String normalizedModel, String prompt) {
        // Retry only on 503 high demand.
        int maxAttempts = 3;
        long backoffMs = 600;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return callGenerateContent(normalizedModel, prompt);
            } catch (RestClientResponseException e) {
                if (e.getRawStatusCode() == 503 && attempt < maxAttempts) {
                    log.warn("Gemini 503 UNAVAILABLE for model {} (attempt {}/{}). Backing off {}ms...", normalizedModel, attempt, maxAttempts, backoffMs);
                    sleep(backoffMs);
                    backoffMs *= 2;
                    continue;
                }
                throw e;
            }
        }
        // Unreachable
        return callGenerateContent(normalizedModel, prompt);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private SymptomCheckResponse callGenerateContent(String normalizedModel, String prompt) {
        // Endpoint expects model path already includes "models/..."
        String url = "https://generativelanguage.googleapis.com/v1/" + normalizedModel + ":generateContent?key=" + apiKey;

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            String raw = response.getBody();
            log.debug("Gemini API raw response: {}", raw);

            String modelText = objectMapper.readTree(raw).at("/candidates/0/content/parts/0/text").asText(null);
            if (modelText == null || modelText.isBlank()) {
                throw new RuntimeException("AI analysis failed: empty response from Gemini");
            }

            String cleaned = stripCodeFences(modelText);

            @SuppressWarnings("unchecked")
            Map<String, String> resultMap = objectMapper.readValue(cleaned, Map.class);

            return SymptomCheckResponse.builder()
                    .analysis(resultMap.get("analysis"))
                    .possibleConditions(resultMap.get("possibleConditions"))
                    .recommendedSpecialty(resultMap.get("recommendedSpecialty"))
                    .urgencyLevel(resultMap.get("urgencyLevel"))
                    .disclaimer("This is an AI-generated preliminary analysis and is not a substitute for professional medical advice.")
                    .build();

        } catch (RestClientResponseException e) {
            log.error("Gemini API error calling {}: status={} body={}", normalizedModel, e.getRawStatusCode(), e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("Failed to call Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("AI analysis failed: " + e.getMessage(), e);
        }
    }

    private String stripCodeFences(String text) {
        String trimmed = text.trim();
        // Common Gemini behavior is to wrap JSON in ```json ... ```
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return trimmed.trim();
    }

    private String normalizeModelName(String configured) {
        String trimmed = configured.trim();
        if (trimmed.startsWith("models/")) {
            return trimmed;
        }
        return "models/" + trimmed;
    }

    /**
     * Calls ListModels and returns all models that support generateContent.
     */
    private List<String> discoverGenerateContentModels() {
        try {
            String url = "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey;
            String raw = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(raw);
            JsonNode models = root.path("models");
            if (!models.isArray() || models.isEmpty()) {
                throw new RuntimeException("ListModels returned no models");
            }

            List<String> supported = new ArrayList<>();
            for (JsonNode m : models) {
                String name = m.path("name").asText(null);
                JsonNode methods = m.path("supportedGenerationMethods");
                if (name != null && methods.isArray()) {
                    for (JsonNode method : methods) {
                        if ("generateContent".equalsIgnoreCase(method.asText())) {
                            supported.add(name);
                            break;
                        }
                    }
                }
            }

            if (supported.isEmpty()) {
                // Fallback to first model name if methods aren't present for some reason.
                String firstName = models.get(0).path("name").asText(null);
                if (firstName != null) {
                    supported.add(firstName);
                }
            }

            log.debug("Discovered {} Gemini models supporting generateContent: {}", supported.size(), supported);
            return supported;

        } catch (RestClientResponseException e) {
            log.error("Gemini ListModels failed: status={} body={}", e.getRawStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException("AI analysis failed: could not list models (" + e.getRawStatusCode() + ")", e);
        } catch (Exception e) {
            throw new RuntimeException("AI analysis failed: could not discover supported models: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(String symptomsText) {
        return "You are a medical AI assistant. Analyze the following symptoms: " + symptomsText + ".\n\n" +
                "Return ONLY valid JSON (no markdown, no code fences, no extra text) with EXACT keys: analysis, possibleConditions, recommendedSpecialty, urgencyLevel.\n" +
                "analysis: brief professional summary.\n" +
                "possibleConditions: comma-separated 2-3 conditions.\n" +
                "recommendedSpecialty: single specialty (e.g., Cardiology).\n" +
                "urgencyLevel: Immediate|Soon|Routine.";
    }
}

