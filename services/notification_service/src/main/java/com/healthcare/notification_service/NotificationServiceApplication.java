package com.healthcare.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     NOTIFICATION SERVICE STARTED SUCCESSFULLY!               ║");
        System.out.println("║     Port: 3002                                               ║");
        System.out.println("║     MySQL Database Connected                                 ║");
        System.out.println("║     WhatsApp + Email Notifications                          ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}