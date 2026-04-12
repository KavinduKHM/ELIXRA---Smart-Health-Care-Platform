package com.healthcare.auth_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Role Entity - Represents user roles in the system
 *
 * This entity stores different roles that users can have:
 * - ROLE_PATIENT: Regular patient users
 * - ROLE_DOCTOR: Doctor users who can issue prescriptions
 * - ROLE_ADMIN: Admin users who can manage the system
 *
 * @Entity - Marks this as a JPA entity (maps to database table)
 * @Table - Specifies the table name and constraints
 */
@Entity
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(length = 200)
    private String description;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();

    /**
     * Predefined role names for the system.
     * The ROLE_ prefix is required by Spring Security.
     */
    public enum RoleName {
        ROLE_PATIENT,   // Patient role - can book appointments
        ROLE_DOCTOR,    // Doctor role - can manage patients and issue prescriptions
        ROLE_ADMIN      // Admin role - can manage users and system
    }
}