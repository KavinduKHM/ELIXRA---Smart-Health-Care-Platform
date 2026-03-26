package com.healthcare.appointment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main entry point for Appointment Service.
 *
 * @SpringBootApplication - Combines @Configuration, @EnableAutoConfiguration, @ComponentScan
 * @EnableDiscoveryClient - Registers with Eureka for service discovery
 * @EnableFeignClients - Enables Feign clients for calling other services
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
public class AppointmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentServiceApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     APPOINTMENT SERVICE STARTED SUCCESSFULLY!                ║");
        System.out.println("║     Port: 8084                                               ║");
        System.out.println("║     API Base: http://localhost:8084/api/appointments         ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}