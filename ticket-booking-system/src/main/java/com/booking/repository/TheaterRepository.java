package com.booking.repository;

import com.booking.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheaterRepository
        extends JpaRepository<Theater, Long> {
    boolean existsByNameAndLocation(String name, String location);
}