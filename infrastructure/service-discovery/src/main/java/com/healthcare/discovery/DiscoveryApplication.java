package com.healthcare.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Service Discovery Server (Eureka)
 *
 * This service acts as a registry where all microservices register themselves.
 * Other services can discover each other through this registry.
 *
 * @EnableEurekaServer - Marks this as a Eureka server (registry)
 */
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryApplication.class, args);

        System.out.println("\n" +
                "╔══════════════════════════════════════════════════════════════════════════════╗\n" +
                "║                                                                              ║\n" +
                "║     EUREKA SERVICE DISCOVERY SERVER STARTED SUCCESSFULLY!                    ║\n" +
                "║                                                                              ║\n" +
                "║     Dashboard:  http://localhost:8761                                        ║\n" +
                "║     Port:       8761                                                         ║\n" +
                "║                                                                              ║\n" +
                "║     IMPORTANT: Start other services AFTER this server is running!            ║\n" +
                "║                                                                              ║\n" +
                "╚══════════════════════════════════════════════════════════════════════════════╝\n");
    }
}