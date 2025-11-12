package com.convergex.backend.controller;

import com.convergex.backend.model.ERole;
import com.convergex.backend.model.Role;
import com.convergex.backend.model.User;
import com.convergex.backend.payload.AuthResponse;
import com.convergex.backend.payload.LoginRequest;
import com.convergex.backend.payload.MessageResponse;
import com.convergex.backend.payload.SignUpRequest;
import com.convergex.backend.repository.RoleRepository;
import com.convergex.backend.repository.UserRepository;
import com.convergex.backend.security.jwt.JwtUtils;
import com.convergex.backend.security.services.UserDetailsImpl;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new AuthResponse(jwt,
                                                  userDetails.getId(),
                                                  userDetails.getEmail(),
                                                  userDetails.getName(),
                                                  roles));
    }

    // --- REVERTED SIGNUP METHOD ---
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        
        // ** REPLACE THIS WITH YOUR COLLEGE'S DOMAIN **
        if (!signUpRequest.getEmail().endsWith("@tkmce.ac.in")) { 
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Only @tkmce.ac.in emails are allowed."));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getName(),
                             signUpRequest.getEmail(),
                             encoder.encode(signUpRequest.getPassword()),
                             signUpRequest.getPhoneNumber(),
                             signUpRequest.getDepartment(),
                             signUpRequest.getYearOfStudy());

        Set<Role> roles = new HashSet<>();
        
        // ** REPLACE THIS WITH YOUR SUPER ADMIN EMAIL **
        String superAdminEmail = "241119@tkmce.ac.in"; 

        if (signUpRequest.getEmail().equals(superAdminEmail)) {
            // Assign all roles
            Role userRole = roleRepository.findByName(ERole.ROLE_USER).orElseThrow(() -> new RuntimeException("Error: Role USER not found."));
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow(() -> new RuntimeException("Error: Role ADMIN not found."));
            Role superAdminRole = roleRepository.findByName(ERole.ROLE_SUPER_ADMIN).orElseThrow(() -> new RuntimeException("Error: Role SUPER_ADMIN not found."));
            roles.add(userRole); roles.add(adminRole); roles.add(superAdminRole);
        } else {
            // Assign default role
            Role userRole = roleRepository.findByName(ERole.ROLE_USER).orElseThrow(() -> new RuntimeException("Error: Role USER not found."));
            roles.add(userRole);
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        
        logger.info("AuthController: Saved new user with email [{}] and ID [{}]", savedUser.getEmail(), savedUser.getId());
        
        // Just return a success message, NOT a token
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}