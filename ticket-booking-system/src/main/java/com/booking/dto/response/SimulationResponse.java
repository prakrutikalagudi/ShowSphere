package com.booking.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SimulationResponse {
    private int success;
    private int failed;
    private long durationMs;
    private String seatNumber;
}