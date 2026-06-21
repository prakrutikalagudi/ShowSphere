package com.booking.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long showId;
    private String movieTitle;
    private String seatNumber;
    private LocalDateTime bookingTime;
    private String bookingStatus;
    private BigDecimal totalAmount;
}