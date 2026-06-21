package com.booking.service;

import com.booking.dto.request.MovieRequest;
import com.booking.dto.response.MovieResponse;
import com.booking.entity.Movie;
import com.booking.exception.ResourceNotFoundException;
import com.booking.repository.MovieRepository;
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
public class MovieService {

    private final MovieRepository movieRepository;

    @Transactional
    public MovieResponse addMovie(MovieRequest request) {
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .genre(request.getGenre())
                .duration(request.getDuration())
                .language(request.getLanguage())
                .description(request.getDescription())
                .build();

        Movie saved = movieRepository.save(movie);
        log.info("Movie added: {}", saved.getTitle());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Movie not found with id: " + id));
        return mapToResponse(movie);
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        movie.setTitle(request.getTitle());
        movie.setGenre(request.getGenre());
        movie.setDuration(request.getDuration());
        movie.setLanguage(request.getLanguage());
        movie.setDescription(request.getDescription());
        Movie saved = movieRepository.save(movie);
        log.info("Movie updated: {}", saved.getTitle());
        return mapToResponse(saved);
    }

    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
        
        // Find all shows of this movie
        List<Show> shows = showRepository.findByMovieId(id);
        
        for (Show show : shows) {
            // Delete bookings first (foreign key to show & seat)
            List<Booking> bookings = bookingRepository.findByShowId(show.getId());
            bookingRepository.deleteAll(bookings);
            
            // Delete seats next (foreign key to show)
            List<Seat> seats = seatRepository.findByShowId(show.getId());
            seatRepository.deleteAll(seats);
            
            // Delete show
            showRepository.delete(show);
        }

        movieRepository.delete(movie);
        log.info("Movie deleted: {}", id);
    }

    private MovieResponse mapToResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .genre(movie.getGenre())
                .duration(movie.getDuration())
                .language(movie.getLanguage())
                .description(movie.getDescription())
                .build();
    }
}