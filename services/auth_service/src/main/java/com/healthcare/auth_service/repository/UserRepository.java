package com.healthcare.auth_service.repository;

import com.healthcare.auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Extends JpaRepository which provides basic CRUD operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username.
     * Used during authentication when user logs in with username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by email.
     * Used during authentication when user logs in with email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a username already exists in the database.
     * Used during registration to prevent duplicate usernames.
     */
    boolean existsByUsername(String username);

    /**
     * Check if an email already exists in the database.
     * Used during registration to prevent duplicate emails.
     */
    boolean existsByEmail(String email);
}