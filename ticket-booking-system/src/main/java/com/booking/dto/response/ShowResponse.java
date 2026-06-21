package com.booking.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ShowResponse {
    private Long id;
    private MovieResponse movie;
    private TheaterResponse theater;
    private LocalDateTime showTime;
    private BigDecimal ticketPrice;
}