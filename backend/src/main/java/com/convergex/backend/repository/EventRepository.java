package com.convergex.backend.repository;

import com.convergex.backend.model.Event;
import com.convergex.backend.model.User; // Import User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByTitleContainingIgnoreCase(String query);
    
    // --- NEW: For Analytics ---
    List<Event> findByPostedBy(User user);
}