package com.healthcare.telemedicine_service;

import com.healthcare.telemedicine_service.config.AgoraConfig;
import io.agora.media.RtcTokenBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for generating Agora tokens for video session authentication.
 *
 * Agora tokens are required for users to join video channels.
 * Tokens contain channel name, user ID, role, and expiration time.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgoraTokenService {

    private final AgoraConfig agoraConfig;

    // Agora user roles
    private static final int ROLE_PUBLISHER = 1;  // Can send audio/video
    private static final int ROLE_SUBSCRIBER = 2; // Can only receive

    /**
     * Generates a token for a user to join a video session.
     *
     * @param channelName The Agora channel name (format: appointment_{id})
     * @param userId The user ID (patient or doctor)
     * @return The generated token string
     */
    public String generateToken(String channelName, Long userId) {
        try {
            RtcTokenBuilder tokenBuilder = new RtcTokenBuilder();

            int currentTimestamp = (int) (System.currentTimeMillis() / 1000);
            int tokenExpiration = currentTimestamp + agoraConfig.getTokenExpiration();

            // Convert userId to string for Agora
            String userAccount = userId.toString();

            // Build token with publisher role (can send and receive)
            String token = tokenBuilder.buildTokenWithUserAccount(
                    agoraConfig.getAppId(),
                    agoraConfig.getAppCertificate(),
                    channelName,
                    userAccount,
                    ROLE_PUBLISHER,
                    tokenExpiration
            );

            log.debug("Generated token for channel: {}, user: {}", channelName, userId);
            return token;

        } catch (Exception e) {
            log.error("Failed to generate Agora token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate video token: " + e.getMessage());
        }
    }

    /**
     * Returns the Agora App ID for client-side SDK initialization.
     */
    public String getAppId() {
        return agoraConfig.getAppId();
    }
}