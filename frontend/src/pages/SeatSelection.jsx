import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSeatsByShow, bookSeat } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SeatSelection = () => {
  const { showId }              = useParams();
  const location                = useLocation();
  const navigate                = useNavigate();
  const show                    = location.state?.show;
  const [seats,    setSeats]    = useState([]);
  const [selected, setSelected] = useState([]); 
  const [loading,  setLoading]  = useState(true);
  const [booking,  setBooking]  = useState(false);

  useEffect(() => { fetchSeats(); }, [showId]);

  const fetchSeats = async () => {
    try {
      const res = await getSeatsByShow(showId);
      setSeats(res.data.data || []);
    } catch {
      toast.error('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    setSelected(prev => {
      const isAlreadySelected = prev.find(s => s.id === seat.id);

      if (isAlreadySelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 10) {
          toast.error('Maximum 10 seats allowed!');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const handleBook = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one seat!');
      return;
    }

    setBooking(true);
    let successCount = 0;
    let failCount    = 0;

    try {
      for (const seat of selected) {
        try {
          await bookSeat({
            showId: Number(showId),
            seatId: seat.id
          });
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`Failed to book seat ${seat.seatNumber}:`,
            err.response?.data?.message);
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(
          `🎉 ${successCount} seat(s) booked successfully!`);
        navigate('/my-bookings');
      } else if (successCount > 0 && failCount > 0) {
        toast.success(`✅ ${successCount} booked!`);
        toast.error(`❌ ${failCount} failed!`);
        navigate('/my-bookings');
      } else {
        toast.error('All bookings failed!');
        fetchSeats();
        setSelected([]);
      }

    } catch (err) {
      toast.error('Booking failed!');
    } finally {
      setBooking(false);
    }
  };

  const isSelected = (seat) =>
    selected.some(s => s.id === seat.id);

  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatNumber[0];
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  Object.keys(seatsByRow).forEach(row => {
    seatsByRow[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.substring(1), 10);
      const numB = parseInt(b.seatNumber.substring(1), 10);
      return numA - numB;
    });
  });

  const getSeatStyle = (seat) => {
    if (isSelected(seat))            return 'seat-selected';
    if (seat.status === 'BOOKED')    return 'seat-booked';
    if (seat.status === 'RESERVED')  return 'seat-reserved';
    return 'seat-available';
  };

  const available = seats.filter(
    s => s.status === 'AVAILABLE').length;
  const booked    = seats.filter(
    s => s.status === 'BOOKED').length;

  const totalAmount = selected.length *
    (show?.ticketPrice || 0);

  if (loading) return <LoadingSpinner text="Loading seats..." />;

  return (
    <div className="page-container fade-in">

      {/* Show Info Header */}
      {show && (
        <div style={{
          background: 'var(--color-fog)',
          border: '1px solid var(--color-charcoal)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span className="pill-tag" style={{ marginBottom: '8px', borderColor: 'var(--color-charcoal)' }}>{show.theater?.name}</span>
            <h1 style={{
              fontSize: 'var(--text-heading-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-paper-white)',
              marginBottom: '4px'
            }}>
              💺 {show.movie?.title}
            </h1>
            <p style={{ color: 'var(--color-mid-gray)', fontSize: '13px' }}>
              📅 {new Date(show.showTime).toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{
            background: 'rgba(221, 167, 80, 0.15)',
            border: '1px solid rgba(107, 85, 50, 0.25)',
            padding: '12px 24px',
            borderRadius: '7px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-electric-blue)'
            }}>
              ₹{show.ticketPrice}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-steel)' }}>
              per seat
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {[
          { cls: 'seat-available', label: `Available (${available})` },
          { cls: 'seat-selected',  label: `Selected (${selected.length})` },
          { cls: 'seat-booked',    label: `Booked (${booked})` },
        ].map(({ cls, label }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className={cls} style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px'
            }} />
            <span style={{
              color: 'var(--color-steel)',
              fontSize: '12px'
            }}>{label}</span>
          </div>
        ))}

        <div style={{
          background: 'rgba(221, 167, 80, 0.15)',
          border: '1px solid rgba(221, 167, 80, 0.3)',
          padding: '4px 12px',
          borderRadius: '100px',
          fontSize: '11px',
          color: 'var(--color-electric-blue)'
        }}>
          Max 10 seats per booking
        </div>
      </div>

      {/* Screen Visualizer */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(118, 79, 217, 0.4), transparent)',
        height: '6px',
        borderRadius: '4px',
        margin: '0 auto 8px',
        maxWidth: '600px'
      }} />
      <p style={{
        textAlign: 'center',
        color: 'var(--color-slate)',
        fontSize: '10px',
        marginBottom: '40px',
        letterSpacing: '4px'
      }}>SCREEN</p>

      {/* Seat Map Panel */}
      <div style={{
        background: ' rgb(41, 17, 74)',
        
        border: '1px solid var(--color-charcoal)',
        borderRadius: '10px',
        padding: '32px 16px',
        marginBottom: '32px',
        overflowX: 'auto'
      }}>
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'var(--color-slate)',
              fontSize: '12px',
              fontWeight: 'var(--font-weight-bold)',
              width: '20px',
              textAlign: 'center',
              flexShrink: 0
            }}>{row}</span>

            <div style={{ display: 'flex', gap: '6px' }}>
              {rowSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className={getSeatStyle(seat)}
                  title={`Seat ${seat.seatNumber} - ${seat.status}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px 6px 4px 4px',
                    fontSize: '9px',
                    fontWeight: 'var(--font-weight-bold)',
                    cursor: seat.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease',
                    transform: isSelected(seat) ? 'scale(1.1)' : 'scale(1)',
                    outline: 'none'
                  }}
                >
                  {seat.seatNumber.substring(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Seats Display */}
      {selected.length > 0 && (
        <div style={{
          background: 'var(--color-surface-two)',
          border: '1px solid var(--color-fog)',
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <p style={{
            color: 'var(--color-steel)',
            fontSize: '12px',
            marginBottom: '10px'
          }}>
            Selected Seats:
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {selected.map(seat => (
              <div key={seat.id} style={{
                background: 'rgba(221, 167, 80, 0.15)',
                border: '1px solid rgba(221, 167, 80, 0.3)',
                color: 'var(--color-paper-white)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 'var(--font-weight-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              onClick={() => handleSeatClick(seat)}
              title="Click to deselect"
              >
                {seat.seatNumber}
                <span style={{ fontSize: '14px', lineHeight: 1 }}>×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Summary Action Panel */}
      <div style={{
        background: 'var(--color-surface-one)',
        border: `1px solid ${selected.length > 0 ? 'var(--color-charcoal)' : 'var(--color-fog)'}`,
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        transition: 'all 0.2s'
      }}>
        <div style={{ textAlign: 'left' }}>
          {selected.length > 0 ? (
            <>
              <p style={{
                color: 'var(--color-steel)',
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                {selected.length} seat(s) selected
              </p>
              <p style={{
                fontSize: '18px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-paper-white)',
                marginBottom: '4px'
              }}>
                {selected.map(s => s.seatNumber).join(', ')}
              </p>
              <p style={{
                color: 'var(--color-mid-gray)',
                fontSize: '13px'
              }}>
                Total Amount: <span style={{ color: 'var(--color-paper-white)', fontWeight: 'var(--font-weight-bold)' }}>₹{totalAmount.toFixed(2)}</span>
              </p>
            </>
          ) : (
            <p style={{
              color: 'var(--color-steel)',
              fontSize: '13px'
            }}>
              Select seats above to start booking.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '13px' }}
            >
              Clear Selection
            </button>
          )}

          <button
            className="btn-primary"
            onClick={handleBook}
            disabled={selected.length === 0 || booking}
            style={{ padding: '10px 24px', fontSize: '13px' }}
          >
            {booking ? `Booking...` : `Book ${selected.length || ''} Seat(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;