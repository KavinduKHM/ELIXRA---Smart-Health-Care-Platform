package com.healthcare.telemedicine_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO when joining a video session.
 *
 * Contains all information needed for the client to connect to Agora.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinSessionResponse {

    private Long sessionId;
    private String channelName;      // Agora channel name
    private String token;            // Agora token for authentication
    private String appId;            // Agora App ID (for SDK initialization)
    private Long userId;             // User ID (patient or doctor)
    private String userRole;         // Role in the session
    private Long appointmentId;      // Related appointment ID
    private boolean sessionActive;   // Whether session is active
}