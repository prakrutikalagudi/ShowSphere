package com.booking.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private String genre;
    private Integer duration;
    private String language;
    private String description;
    private String posterUrl;
    private String videoUrl;
}