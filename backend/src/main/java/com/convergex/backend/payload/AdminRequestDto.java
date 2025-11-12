package com.convergex.backend.payload;
import com.convergex.backend.model.AdminRequest; import com.convergex.backend.model.RequestStatus; import java.time.LocalDateTime;
public class AdminRequestDto {
    private Long requestId; private Long userId; private String userName;
    private String userEmail; private RequestStatus status; private LocalDateTime requestedAt;
    public AdminRequestDto(AdminRequest r){ requestId=r.getId(); userId=r.getUser().getId(); userName=r.getUser().getName();
        userEmail=r.getUser().getEmail(); status=r.getStatus(); requestedAt=r.getRequestedAt(); }
    // Getters
    public Long getRequestId(){return requestId;} public Long getUserId(){return userId;} public String getUserName(){return userName;}
    public String getUserEmail(){return userEmail;} public RequestStatus getStatus(){return status;} public LocalDateTime getRequestedAt(){return requestedAt;}
}