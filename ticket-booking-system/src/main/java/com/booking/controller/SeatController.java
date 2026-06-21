package com.booking.controller;

import com.booking.dto.response.ApiResponse;
import com.booking.dto.response.SeatResponse;
import com.booking.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/shows/{showId}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>>
            getSeatsByShow(@PathVariable Long showId) {

        log.info("GET seats for showId: {}", showId);

        List<SeatResponse> seats =
            seatService.getSeatsByShow(showId);

        return ResponseEntity.ok(
            ApiResponse.success(
                "Seats retrieved - " + seats.size() + " found",
                seats));
    }
}