package com.healthcare.payment_service.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {
    
    @Value("${stripe.api.secret-key:sk_test_dummy}")
    private String secretKey;
    
    @PostConstruct
    public void init() {
        if (!secretKey.equals("sk_test_dummy")) {
            Stripe.apiKey = secretKey;
            System.out.println("Stripe initialized successfully!");
            System.out.println("Mode: " + (secretKey.startsWith("sk_live") ? "LIVE" : "TEST"));
        } else {
            System.out.println("⚠️ Stripe not configured. Set STRIPE_SECRET_KEY environment variable.");
        }
    }
}