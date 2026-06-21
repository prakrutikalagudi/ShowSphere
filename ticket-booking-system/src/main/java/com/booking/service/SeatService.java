package com.booking.service;

import com.booking.dto.response.SeatResponse;
import com.booking.exception.ResourceNotFoundException;
import com.booking.repository.SeatRepository;
import com.booking.repository.ShowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatService {

    private final SeatRepository seatRepository;
    private final ShowRepository showRepository;

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByShow(Long showId) {
        if (!showRepository.existsById(showId)) {
            throw new ResourceNotFoundException(
                "Show not found: " + showId);
        }
        return seatRepository.findByShowId(showId)
                .stream()
                .map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .seatNumber(seat.getSeatNumber())
                        .status(seat.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void releaseExpiredReservations() {
        LocalDateTime expiryTime =
            LocalDateTime.now().minusMinutes(2);
        int released =
            seatRepository.releaseExpiredReservations(expiryTime);
        if (released > 0) {
            log.info("Released {} expired reservations", released);
        }
    }
}