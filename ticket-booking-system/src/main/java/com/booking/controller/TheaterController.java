package com.booking.controller;

import com.booking.dto.request.TheaterRequest;
import com.booking.dto.response.*;
import com.booking.service.TheaterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/theaters")
@RequiredArgsConstructor
public class TheaterController {

    private final TheaterService theaterService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> addTheater(
            @Valid @RequestBody TheaterRequest request) {
        TheaterResponse response = theaterService.addTheater(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Theater added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterResponse>>>
            getAllTheaters() {
        return ResponseEntity.ok(ApiResponse.success(
                "Theaters retrieved",
                theaterService.getAllTheaters()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> updateTheater(
            @PathVariable Long id, @Valid @RequestBody TheaterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Theater updated successfully", theaterService.updateTheater(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTheater(@PathVariable Long id) {
        theaterService.deleteTheater(id);
        return ResponseEntity.ok(ApiResponse.success("Theater deleted successfully", null));
    }
}