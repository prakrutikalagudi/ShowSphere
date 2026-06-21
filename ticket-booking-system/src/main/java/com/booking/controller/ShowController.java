package com.booking.controller;

import com.booking.dto.request.ShowRequest;
import com.booking.dto.response.ApiResponse;
import com.booking.dto.response.ShowResponse;
import com.booking.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
@Slf4j
public class ShowController {

    private final ShowService showService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowResponse>>
            createShow(@Valid @RequestBody ShowRequest request) {
        ShowResponse response = showService.createShow(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Show created with 100 seats!", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowResponse>>>
            getAllShows() {
        return ResponseEntity.ok(ApiResponse.success(
                "Shows retrieved",
                showService.getAllShows()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowResponse>>
            getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Show found",
                showService.getShowById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowResponse>> updateShow(
            @PathVariable Long id, @Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Show updated successfully", showService.updateShow(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.ok(ApiResponse.success("Show deleted successfully", null));
    }
}