package com.healthcare.telemedicine_service.controller;

import com.healthcare.telemedicine_service.dto.ChatMessage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.regex.Pattern;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private static final Pattern CHANNEL_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{channel}")
    public void sendMessage(
            @DestinationVariable String channel,
            @Valid ChatMessage message
    ) {
        String safeChannel = normalizeChannel(channel);

        // Basic normalization to avoid sending empty/whitespace-only messages
        String trimmed = message.getMessage() != null ? message.getMessage().trim() : "";
        if (trimmed.isEmpty()) {
            return;
        }

        message.setMessage(trimmed);
        message.setTimestamp(Instant.now());

        messagingTemplate.convertAndSend("/topic/chat." + safeChannel, message);
    }

    private String normalizeChannel(String channel) {
        if (channel == null) {
            throw new IllegalArgumentException("channel is required");
        }
        if (!CHANNEL_PATTERN.matcher(channel).matches()) {
            throw new IllegalArgumentException("invalid channel");
        }
        return channel;
    }
}
