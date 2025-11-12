package com.convergex.backend.controller;
import com.convergex.backend.model.*; import com.convergex.backend.payload.*; import com.convergex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired; import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.*; import java.util.stream.Collectors;
@RestController @RequestMapping("/api/admin-requests") @CrossOrigin(origins = "*")
public class AdminRequestController {
    @Autowired private AdminRequestRepository adminRequestRepository; @Autowired private UserRepository userRepository; @Autowired private RoleRepository roleRepository;
    private User getCurrentUser() { Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + auth.getName())); }

    @PostMapping @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> requestAdminAccess() { User u = getCurrentUser();
        boolean isAdmin = u.getRoles().stream().anyMatch(r -> r.getName()==ERole.ROLE_ADMIN || r.getName()==ERole.ROLE_SUPER_ADMIN);
        if (isAdmin) { return ResponseEntity.badRequest().body(new MessageResponse("Already admin")); }
        if (adminRequestRepository.existsByUser(u)) { AdminRequest existing = adminRequestRepository.findByUser(u).get();
            if (existing.getStatus() == RequestStatus.PENDING) return ResponseEntity.badRequest().body(new MessageResponse("Pending request exists"));
            if (existing.getStatus() == RequestStatus.APPROVED) return ResponseEntity.badRequest().body(new MessageResponse("Already approved"));
            // Optionally handle REJECTED case here (e.g., delete old request before creating new)
            return ResponseEntity.badRequest().body(new MessageResponse("Request status exists")); }
        AdminRequest newReq = new AdminRequest(); newReq.setUser(u); adminRequestRepository.save(newReq);
        return ResponseEntity.ok(new MessageResponse("Request submitted")); }

    @GetMapping("/pending") @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminRequestDto>> getPendingRequests() {
        List<AdminRequestDto> dtos = adminRequestRepository.findByStatus(RequestStatus.PENDING).stream().map(AdminRequestDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos); }

    @PutMapping("/{requestId}/approve") @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) { AdminRequest req = adminRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        if (req.getStatus()!=RequestStatus.PENDING) { return ResponseEntity.badRequest().body(new MessageResponse("Request not pending")); }
        User user = req.getUser(); Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
        user.getRoles().add(adminRole); userRepository.save(user);
        req.setStatus(RequestStatus.APPROVED); req.setReviewedAt(LocalDateTime.now()); adminRequestRepository.save(req);
        return ResponseEntity.ok(new MessageResponse("Request approved")); }

    @PutMapping("/{requestId}/reject") @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) { AdminRequest req = adminRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        if (req.getStatus()!=RequestStatus.PENDING) { return ResponseEntity.badRequest().body(new MessageResponse("Request not pending")); }
        req.setStatus(RequestStatus.REJECTED); req.setReviewedAt(LocalDateTime.now()); adminRequestRepository.save(req);
        return ResponseEntity.ok(new MessageResponse("Request rejected")); }
}