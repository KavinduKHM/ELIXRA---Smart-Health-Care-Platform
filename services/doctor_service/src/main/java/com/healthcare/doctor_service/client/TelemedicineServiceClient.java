package com.healthcare.doctor_service.client;

import com.healthcare.doctor_service.dto.telemedicine.CreateVideoSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.VideoSessionDetailsDTO;
import com.healthcare.doctor_service.dto.telemedicine.JoinVideoSessionResponse;
import com.healthcare.doctor_service.dto.telemedicine.TelemedicineJoinSessionRequest;
import com.healthcare.doctor_service.dto.telemedicine.TelemedicineEndSessionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client to telemedicine-service.
 * telemedicine-service exposes: POST /api/video/sessions
 */
@FeignClient(name = "telemedicine-service")
public interface TelemedicineServiceClient {

    @PostMapping(value = "/api/video/sessions", consumes = MediaType.APPLICATION_JSON_VALUE)
    VideoSessionDetailsDTO createSession(@RequestBody CreateVideoSessionRequest request);

    @PostMapping(value = "/api/video/sessions/join", consumes = MediaType.APPLICATION_JSON_VALUE)
    JoinVideoSessionResponse joinSession(@RequestBody TelemedicineJoinSessionRequest request);

    @PostMapping(value = "/api/video/sessions/end", consumes = MediaType.APPLICATION_JSON_VALUE)
    VideoSessionDetailsDTO endSession(@RequestBody TelemedicineEndSessionRequest request);
}
