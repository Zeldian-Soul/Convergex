package com.convergex.backend.repository;

import com.convergex.backend.model.Event;
import com.convergex.backend.model.EventRegistration;
import com.convergex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByUserAndEvent(User user, Event event);
    boolean existsByUserAndEvent(User user, Event event);
    List<EventRegistration> findByUser(User user);
    
    // --- NEW: For Analytics ---
    long countByEvent(Event event);
}