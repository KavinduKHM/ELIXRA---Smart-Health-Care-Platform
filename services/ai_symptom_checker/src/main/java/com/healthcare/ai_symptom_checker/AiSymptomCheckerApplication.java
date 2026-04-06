package com.healthcare.ai_symptom_checker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class AiSymptomCheckerApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiSymptomCheckerApplication.class, args);
        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║     AI SYMPTOM CHECKER SERVICE STARTED!                      ║");
        System.out.println("║     Port: 8086                                               ║");
        System.out.println("║     API Base URL: http://localhost:8086/api/ai/symptom-checker ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");
    }
}