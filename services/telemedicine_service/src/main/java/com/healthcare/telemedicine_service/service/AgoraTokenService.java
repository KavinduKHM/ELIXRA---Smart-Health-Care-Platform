package com.healthcare.telemedicine_service.service;

import io.agora.media.DynamicKey5;
import io.agora.media.RtcTokenBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Service for generating Agora tokens.
 *
 * Agora tokens are required for authentication when joining a video session.
 * Tokens contain the channel name, user role, and expiration time.
 *
 * IMPORTANT: This uses the official Agora RtcTokenBuilder.
 * You need to add the Agora SDK dependency to your pom.xml.
 */
@Service
@Slf4j
public class AgoraTokenService {

    @Value("${agora.app-id}")
    private String appId;

    @Value("${agora.app-certificate}")
    private String appCertificate;

    @Value("${agora.token-expiration:3600}")
    private int tokenExpirationSeconds;

    /**
     * Generates an Agora token for joining a video session.
     *
     * @param channelName The name of the channel/room to join
     * @param userId The user ID (patient or doctor)
     * @param role The user role (0 = attendee, 1 = publisher)
     * @return The generated token string
     */
    public String generateToken(String channelName, Long userId, int role) {
        try {
            // Convert userId to string for Agora
            String userAccount = userId.toString();

            // Set token expiration timestamps
            int currentTimestamp = (int)(System.currentTimeMillis() / 1000);
            int privilegeExpiredTimestamp = currentTimestamp + tokenExpirationSeconds;

            // Build the token using Agora's RtcTokenBuilder
            RtcTokenBuilder tokenBuilder = new RtcTokenBuilder();
            String token = tokenBuilder.buildTokenWithUserAccount(
                    appId,
                    appCertificate,
                    channelName,
                    userAccount,
                    role,
                    privilegeExpiredTimestamp
            );

            log.debug("Generated token for channel: {}, user: {}, role: {}",
                    channelName, userId, role);

            return token;

        } catch (Exception e) {
            log.error("Failed to generate Agora token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate video token: " + e.getMessage());
        }
    }

    /**
     * Generates token for a publisher (can send audio/video).
     * Publishers are users who can stream their audio/video.
     * Used for both patients and doctors.
     */
    public String generatePublisherToken(String channelName, Long userId) {
        return generateToken(channelName, userId, RtcTokenBuilder.Role.Role_Publisher);
    }

    /**
     * Generates token for a subscriber (can only receive audio/video).
     * Subscribers cannot stream their own audio/video.
     * Not typically used in 1-on-1 consultations.
     */
    public String generateSubscriberToken(String channelName, Long userId) {
        return generateToken(channelName, userId, RtcTokenBuilder.Role.Role_Subscriber);
    }

    /**
     * Alternative token generation using the newer DynamicKey5 (if needed).
     * This is for future reference if you need a different token type.
     */
    public String generateDynamicKey5Token(String channelName, Long userId, int role) {
        try {
            String userAccount = userId.toString();
            int currentTimestamp = (int)(System.currentTimeMillis() / 1000);
            int privilegeExpiredTimestamp = currentTimestamp + tokenExpirationSeconds;

            // Using DynamicKey5 for RTC tokens
            String token = DynamicKey5.generateMediaChannelKey(
                    appId,
                    appCertificate,
                    channelName,
                    userAccount,
                    privilegeExpiredTimestamp,
                    privilegeExpiredTimestamp
            );

            return token;

        } catch (Exception e) {
            log.error("Failed to generate DynamicKey5 token: {}", e.getMessage());
            throw new RuntimeException("Failed to generate video token");
        }
    }

    /**
     * Validates the channel name format.
     * Channel names should follow the pattern: appointment_{appointmentId}
     */
    public boolean isValidChannelName(String channelName) {
        return channelName != null &&
                channelName.matches("^appointment_\\d+$");
    }

    /**
     * Extracts appointment ID from channel name.
     * Channel name format: appointment_{appointmentId}
     */
    public Long getAppointmentIdFromChannelName(String channelName) {
        if (isValidChannelName(channelName)) {
            return Long.parseLong(channelName.split("_")[1]);
        }
        return null;
    }


    public String getAppId() {
        return appId;
    }
}

