package com.healthcare.appointment_service.client;

import com.healthcare.appointment_service.dto.PaymentRequest;
import com.healthcare.appointment_service.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "payment-service", url = "http://payment-service:8087", path = "/api/payments")
public interface PaymentServiceClient {

    @PostMapping("/create-intent")
    PaymentResponse createPaymentIntent(@RequestBody PaymentRequest request);

    @GetMapping("/appointments/{appointmentId}/paid")
    boolean isAppointmentPaid(@PathVariable("appointmentId") Long appointmentId);
}