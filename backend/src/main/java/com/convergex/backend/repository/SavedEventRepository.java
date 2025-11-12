package com.convergex.backend.repository;

import com.convergex.backend.model.Event;
import com.convergex.backend.model.SavedEvent;
import com.convergex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository public interface SavedEventRepository extends JpaRepository<SavedEvent, Long> {
    List<SavedEvent> findByUser(User user);
    Optional<SavedEvent> findByUserAndEvent(User user, Event event);
    boolean existsByUserAndEvent(User user, Event event);
}