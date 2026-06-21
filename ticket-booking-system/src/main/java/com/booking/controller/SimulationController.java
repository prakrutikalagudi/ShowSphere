package com.booking.controller;

import com.booking.dto.response.*;
import com.booking.service.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/book-same-seat")
    public ResponseEntity<ApiResponse<SimulationResponse>>
            simulate(@RequestParam Long showId,
                     @RequestParam Long seatId) {
        SimulationResponse response =
            simulationService.simulateConcurrentBooking(
                showId, seatId);
        return ResponseEntity.ok(ApiResponse.success(
                "Simulation complete!", response));
    }
}