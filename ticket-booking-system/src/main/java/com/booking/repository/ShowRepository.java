package com.booking.repository;

import com.booking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    @Query("SELECT s FROM Show s " +
           "JOIN FETCH s.movie " +
           "JOIN FETCH s.theater")
    List<Show> findAllWithDetails();

    List<Show> findByMovieId(Long movieId);
    List<Show> findByTheaterId(Long theaterId);
}