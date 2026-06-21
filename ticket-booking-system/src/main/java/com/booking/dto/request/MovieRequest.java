package com.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MovieRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 100)
    private String genre;

    @Min(value = 1, message = "Duration must be positive")
    private Integer duration;

    @Size(max = 50)
    private String language;

    private String description;
}