package io.agora.media;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Minimal, local implementation of an Agora-like token builder used so the project compiles.
 * This is NOT the official Agora implementation. It produces a signed token-like string
 * suitable for development and local testing. Replace with Agora's official library for
 * production use.
 */
public class RtcTokenBuilder {

    public static class Role {
        public static final int Role_Publisher = 1;
        public static final int Role_Subscriber = 0;
    }

    public RtcTokenBuilder() {
    }

    public String buildTokenWithUserAccount(String appId, String appCertificate, String channelName, String userAccount, int role, int privilegeExpiredTimestamp) {
        try {
            String payload = String.join(":", appId, channelName, userAccount, Integer.toString(role), Integer.toString(privilegeExpiredTimestamp));
            String signature = hmacSha256(appCertificate, payload);
            String token = payload + ":" + signature;
            return Base64.getUrlEncoder().withoutPadding().encodeToString(token.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to build token: " + e.getMessage(), e);
        }
    }

    private String hmacSha256(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }
}

