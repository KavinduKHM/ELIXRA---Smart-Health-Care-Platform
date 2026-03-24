package com.healthcare.telemedicine_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.healthcare.telemedicine_service"})
@EnableDiscoveryClient
@EnableScheduling
public class TelemedicineServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelemedicineServiceApplication.class, args);

        // Get active profile to show which environment is running
        String profile = System.getProperty("spring.profiles.active", "default");

        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     TELEMEDICINE SERVICE STARTED!                            ║");
        System.out.println("║     Profile: " + profile + "                                         ║");
        System.out.println("║     Port: 8085                                               ║");
        System.out.println("║     API Base URL: http://localhost:8085/api/video           ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}