import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies, getShows } from '../services/api';
import { getMoviePoster } from './Movies';
import toast from 'react-hot-toast';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showRes] = await Promise.all([getMovies(), getShows()]);
        
        // Local overrides
        const customMovies = JSON.parse(localStorage.getItem('showsphere_custom_movies') || '{}');
        const deletedMovies = JSON.parse(localStorage.getItem('showsphere_deleted_movies') || '[]');
        const customShows = JSON.parse(localStorage.getItem('showsphere_custom_shows') || '{}');
        const deletedShows = JSON.parse(localStorage.getItem('showsphere_deleted_shows') || '[]');

        const filteredMovies = (movieRes.data.data || [])
          .filter(m => !deletedMovies.includes(m.id))
          .map(m => customMovies[m.id] ? { ...m, ...customMovies[m.id] } : m);

        const filteredShows = (showRes.data.data || [])
          .filter(s => !deletedShows.includes(s.id))
          .map(s => {
            let updated = customShows[s.id] ? { ...s, ...customShows[s.id] } : s;
            if (updated.movie && customMovies[updated.movie.id]) {
              updated.movie = { ...updated.movie, ...customMovies[updated.movie.id] };
            }
            return updated;
          });

        setMovies(filteredMovies);
        setShows(filteredShows);
      } catch (err) {
        console.error('Failed to fetch home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ background: 'var(--color-pure-black)', minHeight: '100vh', overflowX: 'hidden' }} className="fade-in">
      
      {/* Cinematic Video Hero Banner */}
      <div style={{
        position: 'relative',
        height: '75vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--color-pure-black)'
      }}>
        {/* Background YouTube Trailer Loop (Cinematic Sci-Fi Trailer Embed) */}
        {/* <iframe
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '56.25vw', // 16:9 ratio
            minHeight: '75vh',
            minWidth: '133.33vh', // 16:9 ratio
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: '0.45',
            border: 'none'
          }}
          src=""
          title="Cinema Hero Trailer Background"
          allow="autoplay; encrypted-media"
        /> */}

        <video
          src={new URL('../assets/video.mp4', import.meta.url).href}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: '0.65'
          }}
        />

        {/* Glossy Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, var(--color-pure-black) 98%)',
          zIndex: 1
        }} />

        {/* Hero Overlay Content */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          right: '5%',
          zIndex: 2,
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          {/* <span className="pill-tag" style={{ 
            borderColor: 'var(--color-electric-blue)', 
            color: 'var(--color-electric-blue)', 
            background: 'rgba(0, 117, 255, 0.1)',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '11px'
          }}>
            🎬 Now Live
          </span> */}
          <h1 style={{
            fontSize: 'var(--text-display)',
            fontWeight: '800',
            lineHeight: '1.1',
            color: 'var(--color-paper-white)',
            letterSpacing: '1px',
            fontFamily: "'Panchang', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '16px',
            textShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            Explore. Book. Immerse.
          </h1>
          <p style={{
            fontSize: '25px',
            color: 'var(--color-mist)',
            maxWidth: '600px',
            lineHeight: '1.4',
            marginBottom: '28px',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)'
          }}>
            Unleash the magic of cinema. Immerse yourself in endless entertainment.
          </p>
          <div>
            <Link to="/movies">
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Browse All Movies ⚡
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content body */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 40px' }}>
        
        {/* Row 1: Now Showing Horizontal Card Row */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-paper-white)', letterSpacing: '-0.5px', fontFamily: "'Panchang', sans-serif" }}>🎥 Trending Releases</h2>
              <p style={{ color: 'var(--color-steel)', fontSize: '13px' }}>Currently scheduled hot movies in theaters.</p>
            </div>
            <Link to="/movies" style={{ color: 'var(--color-electric-blue)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
              View All ›
            </Link>
          </div>

          {movies.length === 0 ? (
            <p style={{ color: 'var(--color-slate)', fontSize: '14px' }}>No movies loaded yet.</p>
          ) : (
            <div style={{
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '20px',
              scrollbarWidth: 'thin'
            }}>
              {movies.map(movie => (
                <div 
                  key={movie.id} 
                  onClick={() => navigate('/shows', { state: { movieId: movie.id } })}
                  style={{
                    width: '280px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    background: 'var(--color-surface-one)',
                    border: '1px solid var(--color-charcoal)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'var(--color-electric-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--color-charcoal)';
                  }}
                >
                  <div style={{ height: '360px', width: '100%', overflow: 'hidden' }}>
                    <img 
                      src={getMoviePoster(movie)} 
                      alt={movie.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '15px', color: 'var(--color-paper-white)', marginBottom: '6px', fontWeight: '600' }}>{movie.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-steel)', fontSize: '11px' }}>
                      <span>🎭 {movie.genre}</span>
                      <span>⏱️ {movie.duration}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-fog)',
        padding: '60px 40px 30px',
        textAlign: 'center',
        color: 'var(--color-steel)',
        fontSize: '13px'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '32px', 
          marginBottom: '40px' 
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-paper-white)', fontFamily: "'Panchang', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>ShowSphere</span>
            <p style={{ color: 'var(--color-steel)', fontSize: '12px', marginTop: '12px', lineHeight: '1.6' }}>
              Premium digital ticket booking engine. Safe, atomic transactions with real-time seat reservation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '80px', textAlign: 'center', justifyContent: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--color-paper-white)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: "'Panchang', sans-serif" }}>Catalog</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/movies" style={{ color: 'inherit', textDecoration: 'none' }}>All Movies</Link>
                <Link to="/shows" style={{ color: 'inherit', textDecoration: 'none' }}>Live Shows</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-paper-white)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: "'Panchang', sans-serif" }}>Account</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>My Profile</Link>
                <Link to="/my-bookings" style={{ color: 'inherit', textDecoration: 'none' }}>Ticket Bookings</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', alignItems: 'center' }}>
          <span>© {new Date().getFullYear()} ShowSphere Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
