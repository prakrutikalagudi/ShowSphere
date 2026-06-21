package com.booking.service;

import com.booking.dto.request.BookingRequest;
import com.booking.dto.response.BookingResponse;
import com.booking.entity.*;
import com.booking.exception.*;
import com.booking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository    seatRepository;
    private final ShowRepository    showRepository;
    private final UserRepository    userRepository;

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponse bookSeat(
            BookingRequest request, String userEmail) {

        log.info("Booking attempt - Seat: {} User: {}",
                request.getSeatId(), userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "User not found: " + userEmail));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Show not found: " + request.getShowId()));

        // PESSIMISTIC WRITE LOCK - key to concurrency safety!
        Seat seat = seatRepository
                .findByIdWithPessimisticLock(request.getSeatId())
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Seat not found: " + request.getSeatId()));

        if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
            log.warn("Seat {} already BOOKED!", seat.getSeatNumber());
            throw new SeatAlreadyBookedException(
                "Seat " + seat.getSeatNumber() + " is already booked!");
        }

        if (seat.getStatus() == Seat.SeatStatus.RESERVED) {
            log.warn("Seat {} is RESERVED!", seat.getSeatNumber());
            throw new SeatAlreadyBookedException(
                "Seat " + seat.getSeatNumber() + " is reserved!");
        }

        seat.setStatus(Seat.SeatStatus.BOOKED);
        seatRepository.save(seat);

        Booking booking = Booking.builder()
                .user(user)
                .show(show)
                .seat(seat)
                .bookingStatus(Booking.BookingStatus.CONFIRMED)
                .totalAmount(show.getTicketPrice())
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("✅ Booking SUCCESS - Seat: {} User: {} ID: {}",
                seat.getSeatNumber(), userEmail, saved.getId());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "User not found: " + userEmail));

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .showId(booking.getShow().getId())
                .movieTitle(booking.getShow().getMovie().getTitle())
                .seatNumber(booking.getSeat().getSeatNumber())
                .bookingTime(booking.getBookingTime())
                .bookingStatus(booking.getBookingStatus().name())
                .totalAmount(booking.getTotalAmount())
                .build();
    }
}