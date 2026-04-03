package com.healthcare.doctor_service.exception;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Makes Feign errors easier to understand when doctor-service calls telemedicine-service.
 */
@RestControllerAdvice
public class TelemedicineClientExceptionHandler {

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Object> handleFeign(FeignException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now().toString());
        body.put("error", "Upstream service error");
        body.put("upstreamStatus", ex.status());
        body.put("message", ex.getMessage());

        // Map 4xx/5xx from upstream to a 502-ish response by default.
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(body);
    }
}

