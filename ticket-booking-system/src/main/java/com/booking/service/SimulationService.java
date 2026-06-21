package com.booking.service;

import com.booking.dto.request.BookingRequest;
import com.booking.dto.response.SimulationResponse;
import com.booking.entity.User;
import com.booking.repository.SeatRepository;
import com.booking.repository.UserRepository;
import com.booking.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    private final BookingService  bookingService;
    private final SeatRepository  seatRepository;
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    public SimulationResponse simulateConcurrentBooking(
            Long showId, Long seatId) {

        log.info("Simulation start - ShowID:{} SeatID:{}",
                showId, seatId);

        String seatNumber = seatRepository.findById(seatId)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Seat not found: " + seatId))
                .getSeatNumber();

        int totalUsers = 100;
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount    = new AtomicInteger(0);

        ExecutorService executor =
            Executors.newFixedThreadPool(totalUsers);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch  = new CountDownLatch(totalUsers);

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < totalUsers; i++) {
            final int userId = i;
            executor.submit(() -> {
                try {
                    startLatch.await();

                    String email =
                        "simuser" + userId + "@test.com";
                    ensureUserExists(email, "SimUser" + userId);

                    bookingService.bookSeat(
                        new BookingRequest(showId, seatId), email);

                    successCount.incrementAndGet();
                    log.info("✅ User {} SUCCESS", userId);

                } catch (Exception e) {
                    failCount.incrementAndGet();
                    log.debug("❌ User {} FAILED: {}",
                            userId, e.getMessage());
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();

        try {
            doneLatch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        executor.shutdown();
        long duration = System.currentTimeMillis() - startTime;

        log.info("Simulation done - Success:{} Failed:{} Time:{}ms",
                successCount.get(), failCount.get(), duration);

        return SimulationResponse.builder()
                .success(successCount.get())
                .failed(failCount.get())
                .durationMs(duration)
                .seatNumber(seatNumber)
                .build();
    }

    private void ensureUserExists(String email, String name) {
        userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .role(User.Role.USER)
                    .build();
            return userRepository.save(user);
        });
    }
}