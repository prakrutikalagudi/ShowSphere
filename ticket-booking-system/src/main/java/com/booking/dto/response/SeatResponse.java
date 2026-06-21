package com.booking.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SeatResponse {
    private Long id;
    private String seatNumber;
    private String status;
}