package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.AvailabilityDTO;
import com.healthcare.appointment_service.dto.DoctorDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Feign client for calling Doctor Service.
 *
 * @FeignClient - Declares a REST client for doctor-service
 * name - The service name as registered in Eureka
 * fallback - Fallback implementation when service is unavailable
 */
@FeignClient(name = "doctor-service", fallback = DoctorServiceClientFallback.class)
public interface DoctorServiceClient {

    /**
     * Get doctor by ID
     */
    @GetMapping("/api/doctors/{id}")
    DoctorDTO getDoctorById(@PathVariable("id") Long id);

    /**
     * Search doctors by specialty and/or name.
     *
     * doctor-service endpoint: GET /api/doctors/search?specialty=...&name=...
     * Returns a list (unpaged).
     */
    @GetMapping("/api/doctors/search")
    List<DoctorDTO> searchDoctors(
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "name", required = false) String name);

    /**
     * Get available slots for a doctor on a specific date.
     *
     * doctor-service endpoint: GET /api/doctors/{doctorId}/availability/slots?date=YYYY-MM-DD
     */
    @GetMapping("/api/doctors/{id}/availability/slots")
    List<AvailabilityDTO> getAvailableSlots(
            @PathVariable("id") Long doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);

    /**
     * Check if doctor is available at specific time
     */
    @GetMapping("/api/doctors/{id}/check-availability")
    boolean checkAvailability(
            @PathVariable("id") Long doctorId,
            @RequestParam("time")
            @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime time);

    /**
     * Book a time slot (marks it as booked in doctor service)
     */
    @PostMapping("/api/doctors/{id}/book-slot")
    void bookTimeSlot(
            @PathVariable("id") Long doctorId,
            @RequestParam("time")
            @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime time);
}