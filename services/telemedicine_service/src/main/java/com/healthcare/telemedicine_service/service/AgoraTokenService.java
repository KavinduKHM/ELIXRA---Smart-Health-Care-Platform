package com.healthcare.telemedicine_service.service;

import io.agora.media.RtcTokenBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    @Value("${agora.app-id:}")
    private String appId;

    @Value("${agora.app-certificate:}")
    private String appCertificate;

    @Value("${agora.token-expiration:3600}")
    private int tokenExpirationSeconds;

    public String getAppId() {
        return appId;
    }

    public String generatePublisherToken(String channelName, Long userId) {
        return generateRtcToken(channelName, userId, RtcTokenBuilder.Role.Role_Publisher);
    }

    public String generateSubscriberToken(String channelName, Long userId) {
        return generateRtcToken(channelName, userId, RtcTokenBuilder.Role.Role_Subscriber);
    }

    private String generateRtcToken(String channelName, Long userId, RtcTokenBuilder.Role role) {
        if (appId == null || appId.isBlank() || appCertificate == null || appCertificate.isBlank()) {
            throw new IllegalStateException("Agora app-id/app-certificate not configured");
        }

        int uid = Math.toIntExact(userId);
        int privilegeExpiredTs = (int) (System.currentTimeMillis() / 1000L) + tokenExpirationSeconds;

        String token = new RtcTokenBuilder().buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                uid,
                role,
                privilegeExpiredTs
        );

        log.debug("Generated Agora RTC token for channel={}, uid={}, role={}", channelName, uid, role);
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