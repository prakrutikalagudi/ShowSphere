package com.booking.controller;

import com.booking.dto.request.MovieRequest;
import com.booking.dto.response.*;
import com.booking.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieResponse>> addMovie(
            @Valid @RequestBody MovieRequest request) {
        MovieResponse response = movieService.addMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Movie added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>>
            getAllMovies() {
        return ResponseEntity.ok(ApiResponse.success(
                "Movies retrieved", movieService.getAllMovies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>>
            getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Movie found", movieService.getMovieById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable Long id, @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Movie updated successfully", movieService.updateMovie(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Movie deleted successfully", null));
    }
}