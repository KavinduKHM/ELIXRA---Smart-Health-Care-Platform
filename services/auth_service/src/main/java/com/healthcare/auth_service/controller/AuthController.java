package com.healthcare.auth_service.controller;

import com.healthcare.auth_service.dto.*;
import com.healthcare.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 *
 * Exposes REST endpoints for authentication operations:
 * - Login: /api/auth/login
 * - Register: /api/auth/register
 * - Refresh Token: /api/auth/refresh
 * - Logout: /api/auth/logout
 * - Validate Token: /api/auth/validate (for API Gateway)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates a user and returns JWT tokens.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Registers a new user and returns JWT token (auto-login).
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Refreshes an expired access token using a refresh token.
     * POST /api/auth/refresh
     * Requires Refresh-Token header.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    /**
     * Logs out a user by blacklisting their token.
     * POST /api/auth/logout
     * Requires Authorization header with Bearer token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        authService.logout(jwt);
        return ResponseEntity.ok().build();
    }

    /**
     * Validates a JWT token and returns user information.
     * Used by the API Gateway to verify tokens.
     * GET /api/auth/validate
     * Requires Authorization header with Bearer token.
     */
    @GetMapping("/validate")
    public ResponseEntity<ValidationResponse> validateToken(@RequestHeader("Authorization") String token) {
        String jwt = token.replace("Bearer ", "");
        return ResponseEntity.ok(authService.validateToken(jwt));
    }
}