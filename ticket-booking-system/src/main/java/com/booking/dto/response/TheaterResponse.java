package com.booking.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TheaterResponse {
    private Long id;
    private String name;
    private String location;
}