package com.convergex.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "event_registrations",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "event_id"})
       })
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // --- FIX: Change LAZY to EAGER ---
    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}