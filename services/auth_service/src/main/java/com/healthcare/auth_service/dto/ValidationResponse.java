package com.healthcare.auth_service.dto;

import java.util.Set;

/**
 * Response DTO for token validation.
 */
public class ValidationResponse {

    private boolean valid;
    private Long userId;
    private String username;
    private Set<String> roles;
    private String message;

    public ValidationResponse() {
    }

    public ValidationResponse(boolean valid, Long userId, String username, Set<String> roles, String message) {
        this.valid = valid;
        this.userId = userId;
        this.username = username;
        this.roles = roles;
        this.message = message;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static ValidationResponseBuilder builder() { return new ValidationResponseBuilder(); }

    public static class ValidationResponseBuilder {
        private boolean valid;
        private Long userId;
        private String username;
        private Set<String> roles;
        private String message;

        public ValidationResponseBuilder valid(boolean valid) { this.valid = valid; return this; }
        public ValidationResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public ValidationResponseBuilder username(String username) { this.username = username; return this; }
        public ValidationResponseBuilder roles(Set<String> roles) { this.roles = roles; return this; }
        public ValidationResponseBuilder message(String message) { this.message = message; return this; }
        public ValidationResponse build() { return new ValidationResponse(valid, userId, username, roles, message); }
    }
}