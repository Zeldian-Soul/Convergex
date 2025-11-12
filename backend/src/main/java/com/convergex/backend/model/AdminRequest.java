package com.convergex.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_requests", uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id"})})
public class AdminRequest {
    @Id @GeneratedValue(strategy = GenerationType.AUTO) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(length = 10, nullable = false) private RequestStatus status;
    @Column(nullable = false, updatable = false) private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;

    @PrePersist protected void onCreate() {
        requestedAt = LocalDateTime.now();
        status = RequestStatus.PENDING;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}