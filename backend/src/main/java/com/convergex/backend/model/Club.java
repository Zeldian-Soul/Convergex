package com.convergex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "clubs")
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    private String clubLogoUrl;

    // A club is managed by one Admin
    @OneToOne
    @JoinColumn(name = "admin_user_id", referencedColumnName = "id")
    @JsonIgnore // Prevent loops
    private User admin;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getClubLogoUrl() { return clubLogoUrl; }
    public void setClubLogoUrl(String clubLogoUrl) { this.clubLogoUrl = clubLogoUrl; }
    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }
}