package com.convergex.backend.controller;

import com.convergex.backend.model.*;
import com.convergex.backend.payload.EventDetailsResponse;
import com.convergex.backend.payload.MessageResponse;
import com.convergex.backend.repository.*;
import com.convergex.backend.service.ImageUploadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired private EventRepository eventRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SavedEventRepository savedEventRepository;
    @Autowired private EventRegistrationRepository eventRegistrationRepository;
    @Autowired private ImageUploadService imageUploadService;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ClubRepository clubRepository;
    @Autowired private UserFollowsClubRepository userFollowsClubRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
               .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + auth.getName()));
    }

    /** GET /api/events (Authenticated users) */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventDetailsResponse>> getAllEvents() {
        User currentUser = getCurrentUser();
        List<Event> allEvents = eventRepository.findAll(); 

        Set<Long> followedClubIds = userFollowsClubRepository.findAllByUser(currentUser).stream()
                .map(follow -> follow.getClub().getId())
                .collect(Collectors.toSet());

        List<EventDetailsResponse> responseList = allEvents.stream().map(event -> {
            boolean isSaved = savedEventRepository.existsByUserAndEvent(currentUser, event);
            boolean isRegistered = eventRegistrationRepository.existsByUserAndEvent(currentUser, event);
            boolean isFollowed = followedClubIds.contains(event.getClub().getId());
            return new EventDetailsResponse(event, isSaved, isRegistered, isFollowed);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /** GET /api/events/feed (Authenticated users) */
    @GetMapping("/feed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventDetailsResponse>> getSubscribedFeed() {
        User currentUser = getCurrentUser();
        
        Set<Club> followedClubs = userFollowsClubRepository.findAllByUser(currentUser).stream()
                .map(UserFollowsClub::getClub)
                .collect(Collectors.toSet());
        
        List<Event> allEvents = eventRepository.findAll();
        
        List<Event> feedEvents = allEvents.stream()
                .filter(event -> followedClubs.contains(event.getClub()))
                .collect(Collectors.toList());

        List<EventDetailsResponse> responseList = feedEvents.stream().map(event -> {
            boolean isSaved = savedEventRepository.existsByUserAndEvent(currentUser, event);
            boolean isRegistered = eventRegistrationRepository.existsByUserAndEvent(currentUser, event);
            return new EventDetailsResponse(event, isSaved, isRegistered, true); 
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /** POST /api/events (Admin/Super Admin only) */
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public Event createEvent(
            @RequestParam("event") String eventJson,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        
        Event eventData = objectMapper.readValue(eventJson, Event.class);
        User currentUser = getCurrentUser();
        
        Club club = clubRepository.findByName(eventData.getClub().getName())
            .orElseGet(() -> {
                Club newClub = new Club();
                newClub.setName(eventData.getClub().getName());
                newClub.setAdmin(currentUser);
                return clubRepository.save(newClub);
            });
            
        Event event = new Event();
        event.setTitle(eventData.getTitle());
        event.setDescription(eventData.getDescription());
        event.setEventDate(eventData.getEventDate());
        event.setEventTime(eventData.getEventTime());
        event.setLocation(eventData.getLocation());
        event.setClub(club);
        event.setPostedBy(currentUser);

        List<String> imageUrls = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileUrl = imageUploadService.store(file);
                    imageUrls.add(fileUrl);
                }
            }
        }
        event.setImageUrls(imageUrls);
        return eventRepository.save(event);
    }

    /** GET /api/events/{id} (Authenticated users) */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventDetailsResponse> getEventById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        boolean isSaved = savedEventRepository.existsByUserAndEvent(currentUser, event);
        boolean isRegistered = eventRegistrationRepository.existsByUserAndEvent(currentUser, event);
        boolean isFollowed = userFollowsClubRepository.existsByUserAndClub(currentUser, event.getClub());

        EventDetailsResponse response = new EventDetailsResponse(event, isSaved, isRegistered, isFollowed);
        return ResponseEntity.ok(response);
    }

    /** POST /api/events/{id}/save (Authenticated users) */
    @PostMapping("/{id}/save")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> saveEvent(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        if (savedEventRepository.existsByUserAndEvent(currentUser, event)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Event is already saved."));
        }

        SavedEvent savedEvent = new SavedEvent();
        savedEvent.setUser(currentUser);
        savedEvent.setEvent(event);
        savedEventRepository.save(savedEvent);

        return ResponseEntity.ok(new MessageResponse("Event saved successfully!"));
    }

    /** DELETE /api/events/{id}/unsave (Authenticated users) */
    @DeleteMapping("/{id}/unsave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unsaveEvent(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        SavedEvent savedEvent = savedEventRepository.findByUserAndEvent(currentUser, event)
                .orElseThrow(() -> new RuntimeException("Error: Event is not saved."));

        savedEventRepository.delete(savedEvent);
        return ResponseEntity.ok(new MessageResponse("Event unsaved successfully!"));
    }

    /** POST /api/events/{id}/register (Authenticated users) */
    @PostMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> registerForEvent(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        if (eventRegistrationRepository.existsByUserAndEvent(currentUser, event)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Already registered for this event."));
        }

        EventRegistration registration = new EventRegistration();
        registration.setUser(currentUser);
        registration.setEvent(event);
        eventRegistrationRepository.save(registration);

        return ResponseEntity.ok(new MessageResponse("Registered for event successfully!"));
    }

    /** GET /api/events/saved (Authenticated users) */
    @GetMapping("/saved")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Event>> getSavedEvents() {
        User currentUser = getCurrentUser();
        List<SavedEvent> savedEvents = savedEventRepository.findByUser(currentUser);
        
        List<Event> events = savedEvents.stream()
                                        .map(SavedEvent::getEvent)
                                        .collect(Collectors.toList());
        return ResponseEntity.ok(events);
    }

    /** GET /api/events/search (Public) */
    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Event> events = eventRepository.findByTitleContainingIgnoreCase(q);
        return ResponseEntity.ok(events);
    }

    /** DELETE /api/events/{id} (Owner or Super Admin only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        boolean isOwner = event.getPostedBy().getId().equals(currentUser.getId());
        boolean isSuperAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_SUPER_ADMIN);

        if (!isOwner && !isSuperAdmin) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                             .body(new MessageResponse("Error: You are not authorized to delete this event."));
        }

        eventRepository.delete(event);
        
        return ResponseEntity.ok(new MessageResponse("Event deleted successfully!"));
    }

    /** PUT /api/events/{id} (Owner or Super Admin only) */
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @RequestParam("event") String eventJson,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        
        User currentUser = getCurrentUser();
        Event eventToUpdate = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Event not found."));

        boolean isOwner = eventToUpdate.getPostedBy().getId().equals(currentUser.getId());
        boolean isSuperAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_SUPER_ADMIN);

        if (!isOwner && !isSuperAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                             .body(new MessageResponse("Error: You are not authorized to edit this event."));
        }
        
        Event updatedData = objectMapper.readValue(eventJson, Event.class);

        eventToUpdate.setTitle(updatedData.getTitle());
        eventToUpdate.setDescription(updatedData.getDescription());
        eventToUpdate.setEventDate(updatedData.getEventDate());
        eventToUpdate.setEventTime(updatedData.getEventTime());
        eventToUpdate.setLocation(updatedData.getLocation());

         // --- UPDATE CLUB LOGIC ---
         Club club = clubRepository.findByName(updatedData.getClub().getName())
            .orElseGet(() -> {
                Club newClub = new Club();
                newClub.setName(updatedData.getClub().getName());
                newClub.setAdmin(getCurrentUser()); 
                return clubRepository.save(newClub);
            });
        eventToUpdate.setClub(club);
        // --- END UPDATE ---

        List<String> imageUrls = new ArrayList<>(eventToUpdate.getImageUrls());
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    imageUrls.add(imageUploadService.store(file));
                }
            }
        }
        eventToUpdate.setImageUrls(imageUrls);

        Event savedEvent = eventRepository.save(eventToUpdate);
        return ResponseEntity.ok(savedEvent);
    }
}