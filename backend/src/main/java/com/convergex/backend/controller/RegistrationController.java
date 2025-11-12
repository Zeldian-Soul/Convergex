package com.convergex.backend.controller;
import com.convergex.backend.model.*; import com.convergex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*; import java.util.List; import java.util.stream.Collectors;
@RestController @RequestMapping("/api/registrations") @CrossOrigin(origins = "*")
public class RegistrationController {
    @Autowired private EventRegistrationRepository registrationRepository; @Autowired private UserRepository userRepository;
    private User getCurrentUser() { Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + auth.getName())); }

    @GetMapping("/my-events") @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getMyRegisteredEvents() { User u = getCurrentUser();
        List<Event> events = registrationRepository.findByUser(u).stream().map(EventRegistration::getEvent).collect(Collectors.toList());
        return ResponseEntity.ok(events); }
}