package com.healthcare.telemedicine_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Telemedicine Service - Main Application Class.
 *
 * This service handles video consultations using Agora.io.
 * It generates tokens for users to join video sessions and manages
 * the lifecycle of video consultations.
 *
 * @EnableDiscoveryClient - Registers this service with Eureka
 * @EnableScheduling - Enables scheduled tasks (e.g., checking missed sessions)
 */
@SpringBootApplication(scanBasePackages = {"com.healthcare.telemedicine_service"})
@EnableDiscoveryClient
@EnableScheduling
public class TelemedicineServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelemedicineServiceApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     TELEMEDICINE SERVICE STARTED!                            ║");
        System.out.println("║     Port: 8085                                               ║");
        System.out.println("║     API Base URL: http://localhost:8085/api/video           ║");
        System.out.println("║     Health Check: http://localhost:8085/actuator/health     ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}