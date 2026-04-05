package com.healthcare.auth_service.repository;

import com.healthcare.auth_service.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Role entity.
 * Used to fetch role information from the database.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find a role by its name (e.g., "ROLE_PATIENT").
     * Used during registration to assign the correct role to a user.
     */
    Optional<Role> findByName(String name);
}