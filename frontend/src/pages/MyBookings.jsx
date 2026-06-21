import { useState, useEffect } from 'react';
import { getMyBookings } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getMoviePoster } from './Movies';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      const allBookings = res.data.data || [];
      const grouped = groupBookings(allBookings);
      setBookings(grouped);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const groupBookings = (allBookings) => {
    const sorted = [...allBookings].sort(
      (a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)
    );

    const grouped = [];
    const processed = new Set();

    sorted.forEach((booking) => {
      if (processed.has(booking.id)) return;

      const groupSeats = sorted.filter((other) => {
        if (processed.has(other.id)) return false;
        if (other.showId !== booking.showId) return false;
        if (other.movieTitle !== booking.movieTitle) return false;

        const timeDiff = Math.abs(
          new Date(booking.bookingTime) -
          new Date(other.bookingTime)
        );
        return timeDiff < 10000;
      });

      groupSeats.forEach(s => processed.add(s.id));
      groupSeats.sort((a, b) =>
        a.seatNumber.localeCompare(b.seatNumber)
      );

      grouped.push({
        bookingIds:    groupSeats.map(s => s.id),
        movieTitle:    booking.movieTitle,
        bookingTime:   booking.bookingTime,
        bookingStatus: booking.bookingStatus,
        seats:         groupSeats.map(s => s.seatNumber),
        seatCount:     groupSeats.length,
        totalAmount:   groupSeats.reduce(
          (sum, s) => sum + Number(s.totalAmount), 0
        ),
        firstBookingId: Math.min(...groupSeats.map(s => s.id)),
        movie:         { title: booking.movieTitle } // For poster lookups
      });
    });

    return grouped;
  };

  const formatDate = (dt) => new Date(dt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (loading)
    return <LoadingSpinner text="Loading your bookings..." />;

  return (
    <div className="page-container fade-in">
      {/* Two-Tone Headline */}
      <div style={{ marginBottom: '60px', textAlign: 'left' }}>
        <h1 style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-paper-white)',
          marginBottom: '4px'
        }}>
          My Bookings /
        </h1>
        <p style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-mid-gray)'
        }}>
          {bookings.length} booking(s) •{' '}
          {bookings.reduce((sum, b) => sum + b.seatCount, 0)}{' '}
          total seats.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'left',
          padding: '60px 0',
          color: 'var(--color-slate)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--color-paper-white)' }}>
            No bookings yet
          </h3>
          <p style={{ color: 'var(--color-mid-gray)', marginBottom: '24px' }}>
            Start booking your favorite movies now.
          </p>
          <a href="/movies" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">
              🎬 Browse Movies
            </button>
          </a>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {bookings.map((booking, i) => (
            <div
              key={booking.firstBookingId}
              className="card fade-in"
              style={{
                padding: '20px',
                animationDelay: `${i * 0.05}s`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--color-surface-one)',
                border: '1px solid var(--color-charcoal)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              
              {/* Ticket Card Top section */}
              <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  {/* Poster Thumbnail */}
                  <div style={{
                    width: '70px',
                    height: '100px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: 'var(--color-pure-black)',
                    flexShrink: 0
                  }}>
                    <img 
                      src={getMoviePoster(booking.movie)} 
                      alt={booking.movieTitle} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Title & DateTime */}
                  <div>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-paper-white)',
                      marginBottom: '6px',
                      lineHeight: '1.3'
                    }}>
                      {booking.movieTitle}
                    </h3>
                    <p style={{
                      color: 'var(--color-steel)',
                      fontSize: '12px',
                      marginBottom: '4px'
                    }}>
                      📅 {formatDate(booking.bookingTime)}
                    </p>
                    <p style={{
                      color: 'var(--color-slate)',
                      fontSize: '11px'
                    }}>
                      ID: #{booking.firstBookingId}
                    </p>
                  </div>
                </div>

                {/* Ticket Seats Detail Area */}
                <div style={{
                  background: 'var(--color-surface-two)',
                  border: '1px solid var(--color-fog)',
                  borderRadius: '7px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-steel)' }}>BOOKED SEATS</span>
                    <span className="new-badge" style={{ fontSize: '10px', padding: '1px 6px', background: 'var(--color-electric-blue)', color: 'var(--color-paper-white)' }}>
                      {booking.seatCount} {booking.seatCount === 1 ? 'SEAT' : 'SEATS'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {booking.seats.map((seat, idx) => (
                      <span key={idx} style={{
                        background: 'var(--color-surface-three)',
                        border: '1px solid var(--color-fog)',
                        color: 'var(--color-paper-white)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row - Status and Amount */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--color-fog)',
                paddingTop: '14px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--color-steel)', marginBottom: '2px' }}>AMOUNT PAID</div>
                  <div style={{ fontSize: '18px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-paper-white)' }}>
                    ₹{booking.totalAmount.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span className="pill-tag" style={{ 
                    borderColor: booking.bookingStatus === 'CONFIRMED' ? 'rgba(70, 211, 105, 0.3)' : 'rgba(229, 9, 20, 0.3)',
                    color: booking.bookingStatus === 'CONFIRMED' ? '#46d369' : '#e50914',
                    background: booking.bookingStatus === 'CONFIRMED' ? 'rgba(70, 211, 105, 0.05)' : 'rgba(229, 9, 20, 0.05)',
                    fontSize: '11px',
                    padding: '4px 10px'
                  }}>
                    {booking.bookingStatus === 'CONFIRMED' ? '● CONFIRMED' : '○ CANCELLED'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;