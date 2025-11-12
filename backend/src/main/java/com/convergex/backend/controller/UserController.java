package com.convergex.backend.controller;

import com.convergex.backend.model.Event; // Import Event
import com.convergex.backend.model.User;
import com.convergex.backend.payload.AdminEventStatsDto; // Import DTO
import com.convergex.backend.payload.MessageResponse;
import com.convergex.backend.payload.UserProfileResponse;
import com.convergex.backend.repository.EventRegistrationRepository; // Import
import com.convergex.backend.repository.EventRepository; // Import
import com.convergex.backend.repository.UserRepository;
import com.convergex.backend.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List; // Import
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private ImageUploadService imageUploadService; // Inject
    @Autowired private EventRepository eventRepository; // Inject
    @Autowired private EventRegistrationRepository registrationRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
               .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + auth.getName()));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        return ResponseEntity.ok(new UserProfileResponse(getCurrentUser()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMyProfile(@RequestBody UserProfileResponse profileUpdate) {
        User currentUser = getCurrentUser();
        
        currentUser.setName(profileUpdate.getName());
        currentUser.setPhoneNumber(profileUpdate.getPhoneNumber());
        currentUser.setDepartment(profileUpdate.getDepartment());
        currentUser.setYearOfStudy(profileUpdate.getYearOfStudy());
        currentUser.setInterests(profileUpdate.getInterests());
        // Note: profilePictureUrl is handled by its own endpoint

        userRepository.save(currentUser);
        
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }

    // --- NEW ENDPOINT: Upload Profile Picture ---
    @PostMapping(value = "/me/picture", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) throws IOException {
        User currentUser = getCurrentUser();
        
        // Store the image and get its URL
        String fileUrl = imageUploadService.store(file);
        
        
        // Save the new URL to the user
        currentUser.setProfilePictureUrl(fileUrl);
        userRepository.save(currentUser);
        
        // Return the new URL in the message field
        return ResponseEntity.ok(new MessageResponse(fileUrl));
    }

    @GetMapping("/me/my-events")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminEventStatsDto>> getMyPostedEvents() {
        User currentUser = getCurrentUser();
        
        // 1. Find all events posted by this user
        List<Event> myEvents = eventRepository.findByPostedBy(currentUser);
        
        // 2. For each event, get the registration count
        List<AdminEventStatsDto> eventStats = myEvents.stream()
            .map(event -> new AdminEventStatsDto(
                event,
                registrationRepository.countByEvent(event) // Get count
            ))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(eventStats);
    }
}