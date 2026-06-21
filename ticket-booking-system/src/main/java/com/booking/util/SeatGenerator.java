package com.booking.util;

import com.booking.entity.Seat;
import com.booking.entity.Show;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class SeatGenerator {

    private static final int ROWS          = 10;
    private static final int SEATS_PER_ROW = 10;

    public List<Seat> generateSeats(Show show) {
        List<Seat> seats = new ArrayList<>();
        for (int row = 0; row < ROWS; row++) {
            char rowLabel = (char) ('A' + row);
            for (int num = 1; num <= SEATS_PER_ROW; num++) {
                Seat seat = Seat.builder()
                        .show(show)
                        .seatNumber(rowLabel + String.valueOf(num))
                        .status(Seat.SeatStatus.AVAILABLE)
                        .build();
                seats.add(seat);
            }
        }
        return seats;
    }
}