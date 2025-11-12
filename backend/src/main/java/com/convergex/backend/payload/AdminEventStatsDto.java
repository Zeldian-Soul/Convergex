package com.convergex.backend.payload;

import com.convergex.backend.model.Event;

public class AdminEventStatsDto {
    
    private Long id;
    private String title;
    private String eventDate;
    private long registrationCount;

    public AdminEventStatsDto(Event event, long registrationCount) {
        this.id = event.getId();
        this.title = event.getTitle();
        this.eventDate = event.getEventDate();
        this.registrationCount = registrationCount;
    }

    // --- Getters ---
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getEventDate() { return eventDate; }
    public long getRegistrationCount() { return registrationCount; }
}