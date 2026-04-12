package com.healthcare.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PaymentServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
        System.out.println("========================================");
        System.out.println("PAYMENT SERVICE STARTED!");
        System.out.println("Port: 8086");
        System.out.println("API Base: http://localhost:8086/api/payments");
        System.out.println("========================================");
    }
}