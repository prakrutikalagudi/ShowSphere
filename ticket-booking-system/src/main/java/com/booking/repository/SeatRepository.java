package com.booking.repository;

import com.booking.entity.Seat;
import com.booking.entity.Seat.SeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowId(Long showId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithPessimisticLock(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Seat s SET s.status = 'AVAILABLE', " +
           "s.reservedAt = null " +
           "WHERE s.status = 'RESERVED' " +
           "AND s.reservedAt < :expiryTime")
    int releaseExpiredReservations(
            @Param("expiryTime") LocalDateTime expiryTime);
}