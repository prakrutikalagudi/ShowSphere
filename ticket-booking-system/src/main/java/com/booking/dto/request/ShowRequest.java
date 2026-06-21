package com.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ShowRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Theater ID is required")
    private Long theaterId;

    @NotNull(message = "Show time is required")
    private LocalDateTime showTime;

    @NotNull(message = "Ticket price is required")
    @DecimalMin(value = "0.01",
                message = "Ticket price must be positive")
    private BigDecimal ticketPrice;
}