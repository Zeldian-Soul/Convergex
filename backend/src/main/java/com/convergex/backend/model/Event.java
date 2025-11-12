package com.convergex.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String description;
    private String eventDate;
    private String eventTime;
    private String location;
    
    // --- REMOVED ---
    // private String clubName;

    // --- NEW: Link to Club entity ---
    @ManyToOne(fetch = FetchType.EAGER) // Use EAGER to easily get club info
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "event_image_urls", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @ManyToOne(fetch = FetchType.EAGER) // Use EAGER
    @JoinColumn(name = "user_id", nullable = false)
    private User postedBy;

    
    // --- Getters & Setters ---

    public Club getClub() { return club; }
    public void setClub(Club club) { this.club = club; }

    public User getPostedBy() { return postedBy; }
    public void setPostedBy(User postedBy) { this.postedBy = postedBy; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public String getEventTime() { return eventTime; }
    public void setEventTime(String eventTime) { this.eventTime = eventTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
}