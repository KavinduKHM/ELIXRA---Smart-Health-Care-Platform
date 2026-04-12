package com.healthcare.telemedicine_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Token service used by TelemedicineService.
 *
 * Note: The original version depended on Agora SDK classes (RtcTokenBuilder/DynamicKey5)
 * which aren't available on the classpath. This implementation generates a short-lived
 * opaque token that the frontend can use (e.g., with Jitsi via JWT/room password) or you
 * can later replace with a real Agora/Jitsi/Twilio token implementation.
 */
@Service
@Slf4j
public class AgoraTokenService {

    @Value("${agora.app-id:dummy-app-id}")
    private String appId;

    private final SecureRandom secureRandom = new SecureRandom();

    public String getAppId() {
        return appId;
    }

    public String generatePublisherToken(String channelName, Long userId) {
        return generateOpaqueToken(channelName, userId, "PUBLISHER");
    }

    public String generateSubscriberToken(String channelName, Long userId) {
        return generateOpaqueToken(channelName, userId, "SUBSCRIBER");
    }

    private String generateOpaqueToken(String channelName, Long userId, String role) {
        // 32 bytes random -> url-safe base64
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        log.debug("Generated opaque video token for channel={}, userId={}, role={}", channelName, userId, role);
        return token;
    }

    public boolean isValidChannelName(String channelName) {
        return channelName != null && channelName.matches("^appointment_\\d+$");
    }

    public Long getAppointmentIdFromChannelName(String channelName) {
        if (isValidChannelName(channelName)) {
            return Long.parseLong(channelName.split("_")[1]);
        }
        return null;
    }
}