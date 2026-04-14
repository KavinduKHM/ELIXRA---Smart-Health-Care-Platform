package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.DoctorDTO;
import com.healthcare.appointment_service.dto.DoctorSearchResponse;
import com.healthcare.appointment_service.dto.TimeSlotDTO;
import org.springframework.cloud.openfeign.FeignClient;
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
@FeignClient(name = "doctor-service",url = "http://doctor-service:8083", fallback = DoctorServiceClientFallback.class)
public interface DoctorServiceClient {

    /**
     * Get doctor by ID
     */
    @GetMapping("/api/doctors/{id}")
    DoctorDTO getDoctorById(@PathVariable("id") Long id);

    /**
     * Search doctors by specialty
     */
    @GetMapping("/api/doctors/search")
    List<DoctorSearchResponse> searchDoctors(
            @RequestParam(value = "specialty", required = false) String specialty,
            @RequestParam(value = "name", required = false) String name);

    /**
     * Get available time slots for a doctor on a specific date
     */
    @GetMapping("/api/doctors/{id}/available-slots")
    List<TimeSlotDTO> getAvailableSlots(
            @PathVariable("id") Long doctorId,
            @RequestParam("date") LocalDate date);

    /**
     * Check if doctor is available at specific time
     */
    @GetMapping("/api/doctors/{id}/check-availability")
    boolean checkAvailability(
            @PathVariable("id") Long doctorId,
            @RequestParam("time") LocalDateTime time);

    /**
     * Book a time slot (marks it as booked in doctor service)
     */
    @PostMapping("/api/doctors/{id}/book-slot")
    void bookTimeSlot(
            @PathVariable("id") Long doctorId,
            @RequestParam("time") LocalDateTime time);
}