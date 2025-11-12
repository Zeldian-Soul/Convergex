package com.convergex.backend.repository;

import com.convergex.backend.model.Club;
import com.convergex.backend.model.User;
import com.convergex.backend.model.UserFollowsClub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowsClubRepository extends JpaRepository<UserFollowsClub, Long> {
    Optional<UserFollowsClub> findByUserAndClub(User user, Club club);
    boolean existsByUserAndClub(User user, Club club);
    List<UserFollowsClub> findAllByUser(User user);
}