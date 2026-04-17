package com.healthcare.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Auth Service Main Application Class
 *
 * This service handles:
 * - User registration and login
 * - JWT token generation and validation
 * - Token refresh and logout (blacklisting)
 * - Role-based access control
 *
 * @SpringBootApplication - Marks this as a Spring Boot application
 * @EnableDiscoveryClient - Registers with Eureka for service discovery
 * @EnableJpaAuditing - Enables automatic timestamp management
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
		System.out.println("╔══════════════════════════════════════════════════════════════╗");
		System.out.println("║     AUTH SERVICE STARTED SUCCESSFULLY!                       ║");
		System.out.println("║     Port: 8081                                               ║");
		System.out.println("║     API Base: http://localhost:8081/api/auth                ║");
		System.out.println("║     Health Check: http://localhost:8081/actuator/health     ║");
		System.out.println("╚══════════════════════════════════════════════════════════════╝");
	}
}