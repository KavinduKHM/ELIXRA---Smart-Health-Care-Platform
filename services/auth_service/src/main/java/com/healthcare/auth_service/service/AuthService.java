package com.healthcare.auth_service.service;

import com.healthcare.auth_service.dto.*;
import com.healthcare.auth_service.model.Role;
import com.healthcare.auth_service.model.User;
import com.healthcare.auth_service.repository.RoleRepository;
import com.healthcare.auth_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Core Authentication Service
 *
 * Handles all authentication-related business logic:
 * - User login (authenticate and generate tokens)
 * - User registration (create new user account)
 * - Token refresh (generate new access token)
 * - Logout (blacklist token)
 * - Token validation (for API Gateway)
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisTemplate<String, Object> redisTemplate;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RedisTemplate<String, Object> redisTemplate) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Authenticates a user and returns JWT tokens.
     *
     * @param request Login credentials (username/email and password)
     * @return AuthResponse with access token, refresh token, and user info
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsernameOrEmail());

        // Authenticate the user with Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );

        // Set the authentication in the security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Update the user's last login timestamp
        User user = (User) authentication.getPrincipal();
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefreshToken(authentication);

        // Prepare roles for response
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        log.info("User logged in successfully: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .expiresIn(jwtService.getExpirationFromToken(accessToken))
                .build();
    }

    /**
     * Registers a new user in the system.
     *
     * @param request Registration details (username, email, password, etc.)
     * @return AuthResponse with access token (auto-login after registration)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());

        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        // Create the new user entity
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))  // Encrypt password
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        // Assign role (default to PATIENT if not specified)
        String roleName = request.getRole() != null ?
                "ROLE_" + request.getRole().toUpperCase() : "ROLE_PATIENT";

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        // Save the user to the database
        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getUsername());

        // Auto-login: generate token for the new user
        String accessToken = jwtService.generateTokenFromUser(savedUser);

        Set<String> roleNames = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .roles(roleNames)
                .expiresIn(jwtService.getExpirationFromToken(accessToken))
                .build();
    }

    /**
     * Refreshes an access token using a valid refresh token.
     *
     * @param refreshToken The refresh token
     * @return New AuthResponse with a fresh access token
     */
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Token refresh request");

        // Validate the refresh token
        if (!jwtService.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Get the user from the token
        String username = jwtService.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate a new access token (keep the same refresh token)
        String newAccessToken = jwtService.generateTokenFromUser(user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)  // Keep the original refresh token
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(roles)
                .expiresIn(jwtService.getExpirationFromToken(newAccessToken))
                .build();
    }

    /**
     * Logs out a user by blacklisting their token.
     * The token is stored in Redis until it would have expired naturally.
     *
     * @param token The JWT token to blacklist
     */
    public void logout(String token) {
        log.info("Logout request for token");

        long expiration = jwtService.getExpirationFromToken(token);
        long ttl = expiration - System.currentTimeMillis();  // Time left until expiry

        if (ttl > 0) {
            // Store the token in Redis blacklist with the remaining TTL
            redisTemplate.opsForValue().set(
                    TOKEN_BLACKLIST_PREFIX + token,
                    "logged_out",
                    ttl,
                    TimeUnit.MILLISECONDS
            );
            log.info("Token blacklisted successfully");
        }
    }

    /**
     * Validates a JWT token and returns user information.
     * Used by the API Gateway to verify tokens and extract user data.
     *
     * @param token The JWT token to validate
     * @return ValidationResponse with validation result and user info
     */
    public ValidationResponse validateToken(String token) {
        // Check if the token is blacklisted (logged out)
        if (isTokenBlacklisted(token)) {
            return ValidationResponse.builder()
                    .valid(false)
                    .message("Token has been logged out")
                    .build();
        }

        // Validate the token signature and expiration
        if (!jwtService.validateToken(token)) {
            return ValidationResponse.builder()
                    .valid(false)
                    .message("Invalid token")
                    .build();
        }

        // Extract user information from the token
        String username = jwtService.getUsernameFromToken(token);
        Long userId = jwtService.getUserIdFromToken(token);

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ValidationResponse.builder()
                    .valid(false)
                    .message("User not found")
                    .build();
        }

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return ValidationResponse.builder()
                .valid(true)
                .userId(userId)
                .username(username)
                .roles(roles)
                .message("Token is valid")
                .build();
    }

    /**
     * Checks if a token is in the Redis blacklist.
     *
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    private boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(
                redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + token)
        );
    }
}