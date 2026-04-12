package com.healthcare.notification_service.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "twilio")
public class TwilioConfig {

    private String accountSid;
    private String authToken;
    private String whatsappNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.equals("your_account_sid_here")) {
            Twilio.init(accountSid, authToken);
            System.out.println("✅ Twilio initialized successfully");
        } else {
            System.out.println("⚠️ Twilio not configured - using mock mode");
        }
    }
}