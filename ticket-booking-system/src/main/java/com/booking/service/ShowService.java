package com.booking.service;

import com.booking.dto.request.ShowRequest;
import com.booking.dto.response.*;
import com.booking.entity.*;
import com.booking.exception.ResourceNotFoundException;
import com.booking.repository.*;
import com.booking.util.SeatGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowService {

    private final ShowRepository    showRepository;
    private final MovieRepository   movieRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository    seatRepository;
    private final SeatGenerator     seatGenerator;

    @Transactional
    public ShowResponse createShow(ShowRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Movie not found: " + request.getMovieId()));

        Theater theater = theaterRepository
                .findById(request.getTheaterId())
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Theater not found: " + request.getTheaterId()));

        Show show = Show.builder()
                .movie(movie)
                .theater(theater)
                .showTime(request.getShowTime())
                .ticketPrice(request.getTicketPrice())
                .build();

        Show savedShow = showRepository.save(show);
        List<Seat> seats = seatGenerator.generateSeats(savedShow);
        seatRepository.saveAll(seats);

        log.info("Show created: {} with {} seats",
                savedShow.getId(), seats.size());

        return mapToResponse(savedShow);
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> getAllShows() {
        return showRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShowResponse getShowById(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Show not found: " + id));
        return mapToResponse(show);
    }

    @Transactional
    public ShowResponse updateShow(Long id, ShowRequest request) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + request.getMovieId()));

        Theater theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new ResourceNotFoundException("Theater not found: " + request.getTheaterId()));

        show.setMovie(movie);
        show.setTheater(theater);
        show.setShowTime(request.getShowTime());
        show.setTicketPrice(request.getTicketPrice());

        Show savedShow = showRepository.save(show);
        log.info("Show updated: {}", savedShow.getId());
        return mapToResponse(savedShow);
    }

    private final BookingRepository bookingRepository;

    @Transactional
    public void deleteShow(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));

        // Delete all bookings of this show first
        List<Booking> bookings = bookingRepository.findByShowId(id);
        bookingRepository.deleteAll(bookings);

        // Delete all seats of this show next
        List<Seat> seats = seatRepository.findByShowId(id);
        seatRepository.deleteAll(seats);

        showRepository.delete(show);
        log.info("Show deleted: {}", id);
    }

    private ShowResponse mapToResponse(Show show) {
        return ShowResponse.builder()
                .id(show.getId())
                .movie(MovieResponse.builder()
                        .id(show.getMovie().getId())
                        .title(show.getMovie().getTitle())
                        .genre(show.getMovie().getGenre())
                        .duration(show.getMovie().getDuration())
                        .language(show.getMovie().getLanguage())
                        .build())
                .theater(TheaterResponse.builder()
                        .id(show.getTheater().getId())
                        .name(show.getTheater().getName())
                        .location(show.getTheater().getLocation())
                        .build())
                .showTime(show.getShowTime())
                .ticketPrice(show.getTicketPrice())
                .build();
    }
}