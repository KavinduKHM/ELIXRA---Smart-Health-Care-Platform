package io.agora.media;

import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * Minimal DynamicKey5-like helper for local development only.
 */
public class DynamicKey5 {
    public static String generateMediaChannelKey(String appId, String appCertificate, String channelName, String userAccount, int ts1, int ts2) {
        String payload = String.join(":", appId, channelName, userAccount, Integer.toString(ts1));
        String signature = Base64.getUrlEncoder().withoutPadding().encodeToString((appCertificate + payload).getBytes(StandardCharsets.UTF_8));
        String token = payload + ":" + signature;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(token.getBytes(StandardCharsets.UTF_8));
    }
}

