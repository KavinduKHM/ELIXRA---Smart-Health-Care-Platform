package com.healthcare.auth_service.service;

import com.healthcare.auth_service.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * JWT (JSON Web Token) Service
 *
 * Handles all JWT operations:
 * - Generating access and refresh tokens
 * - Validating tokens
 * - Extracting user information from tokens
 * - Getting token expiration times
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;  // Secret key for signing tokens

    @Value("${app.jwt.expiration}")
    private int jwtExpiration;  // Access token expiration (milliseconds)

    @Value("${app.jwt.refresh-expiration}")
    private int refreshExpiration;  // Refresh token expiration (milliseconds)

    /**
     * Creates signing key from secret string.
     * HS512 algorithm requires a key of at least 512 bits (64 bytes).
     */
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generates an access token from Spring Security Authentication object.
     * Called after successful login.
     *
     * @param authentication Spring Security authentication object
     * @return JWT access token string
     */
    public String generateAccessToken(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        // Collect user roles as a comma-separated string
        String roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(user.getUsername())           // Username as subject
                .claim("userId", user.getId())            // Custom claim: user ID
                .claim("email", user.getEmail())          // Custom claim: email
                .claim("roles", roles)                    // Custom claim: roles
                .setIssuedAt(now)                         // Token creation time
                .setExpiration(expiryDate)                // Token expiry time
                .signWith(key(), SignatureAlgorithm.HS512) // Sign with secret key
                .compact();                               // Build the token string
    }

    /**
     * Generates a refresh token (longer validity than access token).
     * Used to obtain new access tokens without re-authenticating.
     *
     * @param authentication Spring Security authentication object
     * @return JWT refresh token string
     */
    public String generateRefreshToken(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Generates an access token directly from a User object.
     * Used for auto-login after registration.
     *
     * @param user User entity
     * @return JWT access token string
     */
    public String generateTokenFromUser(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extracts the username from a JWT token.
     *
     * @param token JWT token string
     * @return Username extracted from the token
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Extracts the user ID from a JWT token.
     *
     * @param token JWT token string
     * @return User ID extracted from the token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("userId", Long.class);
    }

    /**
     * Validates a JWT token.
     * Checks signature, expiration, and format.
     *
     * @param token JWT token string
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Gets the token's expiration time in milliseconds.
     *
     * @param token JWT token string
     * @return Expiration timestamp in milliseconds
     */
    public Long getExpirationFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration().getTime();
    }
}