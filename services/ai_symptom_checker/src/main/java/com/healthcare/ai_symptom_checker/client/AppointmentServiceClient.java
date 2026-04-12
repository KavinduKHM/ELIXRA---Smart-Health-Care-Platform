package com.healthcare.ai_symptom_checker.client;

import com.healthcare.ai_symptom_checker.dto.DoctorSearchResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(
        name = "appointment-service",
        url = "${services.appointment-service.url:}"
)
public interface AppointmentServiceClient {

    @GetMapping("/api/appointments/doctors/search")
    List<DoctorSearchResponse> searchDoctors(@RequestParam("specialty") String specialty);
}