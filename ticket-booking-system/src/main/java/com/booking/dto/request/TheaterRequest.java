package com.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TheaterRequest {

    @NotBlank(message = "Theater name is required")
    @Size(max = 200)
    private String name;

    @Size(max = 300)
    private String location;
}