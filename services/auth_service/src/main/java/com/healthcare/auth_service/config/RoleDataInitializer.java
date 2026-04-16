package com.healthcare.auth_service.config;

import com.healthcare.auth_service.model.Role;
import com.healthcare.auth_service.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Seeds the default roles required by the auth service.
 *
 * This prevents registration from failing with "Role not found"
 * when the database is empty or has been recreated.
 */
@Configuration
public class RoleDataInitializer {

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            createRoleIfMissing(roleRepository, Role.RoleName.ROLE_PATIENT.name(), "Patient role");
            createRoleIfMissing(roleRepository, Role.RoleName.ROLE_DOCTOR.name(), "Doctor role");
            createRoleIfMissing(roleRepository, Role.RoleName.ROLE_ADMIN.name(), "Admin role");
        };
    }

    private void createRoleIfMissing(RoleRepository roleRepository, String roleName, String description) {
        roleRepository.findByName(roleName).orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name(roleName)
                        .description(description)
                        .build()));
    }
}

