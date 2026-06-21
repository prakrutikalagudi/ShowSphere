package com.booking.service;

import com.booking.dto.request.TheaterRequest;
import com.booking.dto.response.TheaterResponse;
import com.booking.entity.Theater;
import com.booking.exception.ResourceNotFoundException;
import com.booking.repository.TheaterRepository;
import com.booking.entity.Show;
import com.booking.entity.Seat;
import com.booking.entity.Booking;
import com.booking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TheaterService {

    private final TheaterRepository theaterRepository;

    @Transactional
    public TheaterResponse addTheater(TheaterRequest request) {
        Theater theater = Theater.builder()
                .name(request.getName())
                .location(request.getLocation())
                .build();

        Theater saved = theaterRepository.save(theater);
        log.info("Theater added: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TheaterResponse> getAllTheaters() {
        return theaterRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TheaterResponse updateTheater(Long id, TheaterRequest request) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + id));
        theater.setName(request.getName());
        theater.setLocation(request.getLocation());
        Theater saved = theaterRepository.save(theater);
        log.info("Theater updated: {}", saved.getName());
        return mapToResponse(saved);
    }

    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public void deleteTheater(Long id) {
        Theater theater = theaterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found with id: " + id));

        // Find all shows of this theater
        List<Show> shows = showRepository.findByTheaterId(id);

        for (Show show : shows) {
            // Delete bookings
            List<Booking> bookings = bookingRepository.findByShowId(show.getId());
            bookingRepository.deleteAll(bookings);

            // Delete seats
            List<Seat> seats = seatRepository.findByShowId(show.getId());
            seatRepository.deleteAll(seats);

            // Delete show
            showRepository.delete(show);
        }

        theaterRepository.delete(theater);
        log.info("Theater deleted: {}", id);
    }

    private TheaterResponse mapToResponse(Theater theater) {
        return TheaterResponse.builder()
                .id(theater.getId())
                .name(theater.getName())
                .location(theater.getLocation())
                .build();
    }
}