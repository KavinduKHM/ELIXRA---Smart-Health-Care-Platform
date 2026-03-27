package com.healthcare.patient_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Application Configuration
 * Handles CORS and other global configurations
 */
@Configuration
public class AppConfig implements WebMvcConfigurer {
    
    /**
     * Configure CORS to allow frontend applications to access this service
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*") // In production, restrict to specific domains
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false);
    }
}