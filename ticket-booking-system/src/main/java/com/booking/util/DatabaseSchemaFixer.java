package com.booking.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Running database migration: Changing movies.poster_url to LONGTEXT...");
            jdbcTemplate.execute("ALTER TABLE movies MODIFY COLUMN poster_url LONGTEXT");
            log.info("Database migration successfully altered movies.poster_url to LONGTEXT.");
        } catch (Exception e) {
            log.info("Database migration skipped (column might already be LONGTEXT): {}", e.getMessage());
        }
    }
}
