package com.convergex.backend.payload;

import com.convergex.backend.model.User;
import java.util.List;

public class UserProfileResponse {
    
    private String name;
    private String email;
    private String phoneNumber;
    private String department;
    private String yearOfStudy;
    private List<String> interests;
    
    // --- NEW FIELD ---
    private String profilePictureUrl;

    public UserProfileResponse(User user) {
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.department = user.getDepartment();
        this.yearOfStudy = user.getYearOfStudy();
        this.interests = user.getInterests();
        this.profilePictureUrl = user.getProfilePictureUrl(); // Add this
    }

    public UserProfileResponse() {} // Need default constructor for RequestBody

    // --- NEW GETTER/SETTER ---
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String url) { this.profilePictureUrl = url; }

    // --- All other getters/setters ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(String yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
}