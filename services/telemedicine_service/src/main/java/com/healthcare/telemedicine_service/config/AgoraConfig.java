package com.healthcare.telemedicine_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Agora Configuration Class
 *
 * Reads Agora credentials from application.yml
 *
 * Properties:
 * - app-id: Your Agora App ID
 * - app-certificate: Your Agora App Certificate
 * - token-expiration: Token validity in seconds
 */
@Configuration
@ConfigurationProperties(prefix = "agora")
@Data
public class AgoraConfig {

    private String appId;
    private String appCertificate;
    private int tokenExpiration = 3600; // default 1 hour
}