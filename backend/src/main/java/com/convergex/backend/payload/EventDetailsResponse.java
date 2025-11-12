package com.convergex.backend.payload;

import com.convergex.backend.model.Event;
import java.util.List;

public class EventDetailsResponse {
    
    private Long id;
    private String title;
    private String description;
    private String eventDate;
    private String eventTime;
    private String location;
    
    // --- NEW CLUB FIELDS ---
    private Long clubId;
    private String clubName;
    private String clubLogoUrl;
    // --- END NEW ---

    private List<String> imageUrls;
    private boolean isSaved;
    private boolean isRegistered;
    private Long postedById;
    
    // --- NEW FIELD ---
    private boolean isFollowed; // Is the current user following this club?

    public EventDetailsResponse(Event event, boolean isSaved, boolean isRegistered, boolean isFollowed) {
        this.id = event.getId();
        this.title = event.getTitle();
        this.description = event.getDescription();
        this.eventDate = event.getEventDate();
        this.eventTime = event.getEventTime();
        this.location = event.getLocation();
        
        // --- UPDATED ---
        if (event.getClub() != null) {
            this.clubId = event.getClub().getId();
            this.clubName = event.getClub().getName();
            this.clubLogoUrl = event.getClub().getClubLogoUrl();
        }
        // --- END UPDATE ---
        
        this.imageUrls = event.getImageUrls();
        this.isSaved = isSaved;
        this.isRegistered = isRegistered;
        this.isFollowed = isFollowed; // Set new field
        
        if (event.getPostedBy() != null) {
            this.postedById = event.getPostedBy().getId();
        }
    }

    // --- Add Getters/Setters for new fields ---
    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public String getClubLogoUrl() { return clubLogoUrl; }
    public void setClubLogoUrl(String clubLogoUrl) { this.clubLogoUrl = clubLogoUrl; }
    public boolean isFollowed() { return isFollowed; }
    public void setFollowed(boolean followed) { isFollowed = followed; }

    // --- All other getters and setters ---
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
    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
    public boolean isRegistered() { return isRegistered; }
    public void setRegistered(boolean registered) { isRegistered = registered; }
    public Long getPostedById() { return postedById; }
    public void setPostedById(Long postedById) { this.postedById = postedById; }
}