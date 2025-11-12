package com.convergex.backend.config;

import com.convergex.backend.model.ERole;
import com.convergex.backend.model.Role;
import com.convergex.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements ApplicationRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Check if roles already exist
        if (roleRepository.count() == 0) {
            System.out.println("No roles found, adding default roles...");
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            roleRepository.save(new Role(ERole.ROLE_SUPER_ADMIN));
            System.out.println("Default roles added.");
        } else {
            System.out.println("Roles already exist.");
        }
    }
}