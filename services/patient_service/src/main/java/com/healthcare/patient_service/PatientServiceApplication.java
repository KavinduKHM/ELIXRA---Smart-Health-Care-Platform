package com.healthcare.patient_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PatientServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PatientServiceApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     PATIENT SERVICE STARTED SUCCESSFULLY!                    ║");
        System.out.println("║     Port: 8082                                               ║");
        System.out.println("║     API Base URL: http://localhost:8082/api/patients        ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}