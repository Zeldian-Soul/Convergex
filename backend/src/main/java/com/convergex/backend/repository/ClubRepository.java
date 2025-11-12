package com.convergex.backend.repository;

import com.convergex.backend.model.Club;
import com.convergex.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    Optional<Club> findByName(String name);
    Optional<Club> findByAdmin(User admin);
}