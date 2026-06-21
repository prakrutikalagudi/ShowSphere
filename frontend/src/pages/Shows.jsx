import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getShows } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { getMoviePoster } from './Movies';

const Shows = () => {
  const [shows,   setShows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate  = useNavigate();
  const location  = useLocation();
  const filterMovieId = location.state?.movieId;

  useEffect(() => { fetchShows(); }, []);

  const fetchShows = async () => {
    try {
      const res = await getShows();
      const customMovies = JSON.parse(localStorage.getItem('showsphere_custom_movies') || '{}');
      const customShows = JSON.parse(localStorage.getItem('showsphere_custom_shows') || '{}');
      const deletedShows = JSON.parse(localStorage.getItem('showsphere_deleted_shows') || '[]');

      const filtered = (res.data.data || [])
        .filter(s => !deletedShows.includes(s.id))
        .map(s => {
          let updated = customShows[s.id] ? { ...s, ...customShows[s.id] } : s;
          if (updated.movie && customMovies[updated.movie.id]) {
            updated.movie = { ...updated.movie, ...customMovies[updated.movie.id] };
          }
          return updated;
        });

      setShows(filtered);
    } catch {
      toast.error('Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
  const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const filteredShows = filterMovieId
    ? shows.filter(s => s.movie?.id === filterMovieId)
    : shows;

  if (loading) return <LoadingSpinner text="Loading shows..." />;

  const selectedMovieTitle = filteredShows.length > 0 && filterMovieId 
    ? filteredShows[0].movie?.title 
    : null;

  // Retrieve stored video URL for the filtered movie
  const getMovieVideoUrl = () => {
    if (!filterMovieId) return null;
    const localV = JSON.parse(localStorage.getItem('showsphere_videos') || '{}');
    const rawVal = localV[filterMovieId];
    if (!rawVal) return null;
    
    // Format youtube link into embed if it is a raw ID or standard watch link
    if (rawVal.includes('youtube.com/embed/') || rawVal.includes('player.vimeo.com')) {
      return rawVal;
    }
    if (rawVal.includes('youtube.com/watch?v=')) {
      const parts = rawVal.split('v=');
      const id = parts[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (rawVal.includes('youtu.be/')) {
      const parts = rawVal.split('youtu.be/');
      const id = parts[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Assume it is a raw video ID
    return `https://www.youtube.com/embed/${rawVal}`;
  };

  const videoUrl = getMovieVideoUrl();

  return (
    <div className="page-container fade-in">
      {/* Dynamic Movie Video Trailer Section */}
      {videoUrl && (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '40px',
          border: '1px solid var(--color-charcoal)',
          background: '#000',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <iframe
            src={`${videoUrl}?autoplay=1&mute=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            title="Movie Trailer"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      )}

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
          {selectedMovieTitle ? `${selectedMovieTitle} /` : 'Available Shows /'}
        </h1>
        <p style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-steel)'
        }}>
          {filteredShows.length} shows scheduled.
        </p>
      </div>

      {filteredShows.length === 0 ? (
        <div style={{ textAlign: 'left', padding: '80px 0', color: 'var(--color-slate)' }}>
          <p>No shows available for the selected parameters at the moment.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredShows.map((show, i) => (
            <div key={show.id} className="card fade-in"
              style={{ 
                animationDelay: `${i * 0.08}s`,
                display: 'flex',
                gap: '20px',
                padding: '16px',
                background: 'var(--color-surface-one)',
                border: '1px solid var(--color-charcoal)',
                borderRadius: '10px',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-electric-blue)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-charcoal)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              
              {/* Show Poster Thumbnail */}
              <div style={{
                width: '120px',
                height: '180px',
                flexShrink: 0,
                borderRadius: '7px',
                overflow: 'hidden',
                background: 'var(--color-pure-black)'
              }}>
                <img 
                  src={getMoviePoster(show.movie || {})} 
                  alt={show.movie?.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Show Information Content */}
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-paper-white)' }}>
                      {show.movie?.title}
                    </h3>
                    <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-electric-blue)' }}>
                      ₹{show.ticketPrice}
                    </span>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <span className="pill-tag" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {show.movie?.genre}
                    </span>
                  </div>

                  {/* Show Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    borderRadius: '7px',
                    padding: '10px',
                    marginBottom: '14px'
                  }}>
                    {[
                      { label: 'Date', value: formatDate(show.showTime) },
                      { label: 'Time', value: formatTime(show.showTime) },
                      { label: 'Theater', value: show.theater?.name },
                      { label: 'Location', value: show.theater?.location },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ color: 'var(--color-steel)', fontSize: '10px' }}>{label}</div>
                        <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '12px', color: 'var(--color-paper-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => navigate(`/shows/${show.id}/seats`, {
                    state: { show }
                  })}
                >
                  💺 Select Seats
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shows;