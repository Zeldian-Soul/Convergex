package com.convergex.backend.repository;

import com.convergex.backend.model.AdminRequest;
import com.convergex.backend.model.RequestStatus;
import com.convergex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {
    boolean existsByUser(User user);
    Optional<AdminRequest> findByUser(User user);
    List<AdminRequest> findByStatus(RequestStatus status);
}