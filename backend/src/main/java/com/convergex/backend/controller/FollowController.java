package com.convergex.backend.controller;

import com.convergex.backend.model.Club;
import com.convergex.backend.model.User;
import com.convergex.backend.model.UserFollowsClub;
import com.convergex.backend.payload.MessageResponse;
import com.convergex.backend.repository.ClubRepository;
import com.convergex.backend.repository.UserFollowsClubRepository;
import com.convergex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follow")
@CrossOrigin(origins = "*")
public class FollowController {

    @Autowired private UserRepository userRepository;
    @Autowired private ClubRepository clubRepository;
    @Autowired private UserFollowsClubRepository userFollowsClubRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
               .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + auth.getName()));
    }

    @PostMapping("/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> followClub(@PathVariable Long clubId) {
        User user = getCurrentUser();
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        if (userFollowsClubRepository.existsByUserAndClub(user, club)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Already following this club"));
        }

        UserFollowsClub follow = new UserFollowsClub();
        follow.setUser(user);
        follow.setClub(club);
        userFollowsClubRepository.save(follow);

        return ResponseEntity.ok(new MessageResponse("Club followed successfully"));
    }

    @DeleteMapping("/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unfollowClub(@PathVariable Long clubId) {
        User user = getCurrentUser();
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        UserFollowsClub follow = userFollowsClubRepository.findByUserAndClub(user, club)
                .orElseThrow(() -> new RuntimeException("Not following this club"));

        userFollowsClubRepository.delete(follow);

        return ResponseEntity.ok(new MessageResponse("Club unfollowed successfully"));
    }
}