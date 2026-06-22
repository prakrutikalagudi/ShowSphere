package com.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "movies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 100)
    private String genre;

    private Integer duration;

    @Column(length = 50)
    private String language;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "poster_url", length = 1000)
    private String posterUrl;

    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}