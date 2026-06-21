import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMovies } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

// Curated Unsplash images for generic fallback movie posters
export const getMoviePoster = (movie) => {
  if (!movie) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500';

  // Check local storage for user-added posters
  const localPosters = JSON.parse(localStorage.getItem('showsphere_posters') || '{}');
  
  // Look up by movie ID, title, or lowercase title
  const customPoster = localPosters[movie.id] 
    || localPosters[movie.title] 
    || (movie.title && localPosters[movie.title.toLowerCase()]) 
    || movie.posterUrl;
  
  if (customPoster && typeof customPoster === 'string' && customPoster.trim().length > 5) {
    return customPoster.trim();
  }

  const genre = (movie.genre || '').toLowerCase();
  if (genre.includes('sci')) {
    return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500';
  }
  if (genre.includes('act') || genre.includes('thrill')) {
    return 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500';
  }
  if (genre.includes('dram') || genre.includes('roman')) {
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500';
  }
  if (genre.includes('horr') || genre.includes('myst')) {
    return 'https://images.unsplash.com/photo-1505635338219-0a113f66886f?q=80&w=500';
  }
  if (genre.includes('comed')) {
    return 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=500';
  }
  return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500';
};

const Movies = () => {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await getMovies();
      const customMovies = JSON.parse(localStorage.getItem('showsphere_custom_movies') || '{}');
      const deletedMovies = JSON.parse(localStorage.getItem('showsphere_deleted_movies') || '[]');

      const filtered = (res.data.data || [])
        .filter(m => !deletedMovies.includes(m.id))
        .map(m => customMovies[m.id] ? { ...m, ...customMovies[m.id] } : m);

      setMovies(filtered);
    } catch {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const searchVal = new URLSearchParams(location.search).get('search') || '';

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(searchVal.toLowerCase()) ||
    m.genre?.toLowerCase().includes(searchVal.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Loading movies..." />;

  return (
    <div className="page-container fade-in">
      {/* Header Block with Two-Tone Headline */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '60px',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{
            fontSize: 'var(--text-heading)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--leading-heading)',
            letterSpacing: 'var(--tracking-heading)',
            color: 'var(--color-paper-white)',
            marginBottom: '4px'
          }}>
            Now Showing /
          </h1>
          <p style={{
            fontSize: 'var(--text-heading)',
            fontWeight: 'var(--font-weight-bold)',
            lineHeight: 'var(--leading-heading)',
            letterSpacing: 'var(--tracking-heading)',
            color: 'var(--color-mid-gray)'
          }}>
            {movies.length} movies available.
          </p>
        </div>
      </div>

      {/* Movies Showcase Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'left', padding: '80px 0', color: 'var(--color-slate)' }}>
          <p style={{ fontSize: '18px' }}>No movies found in current selection.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((movie, i) => (
            <div key={movie.id} className="card fade-in"
              style={{
                cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
                padding: '0',
                overflow: 'hidden',
                borderRadius: '10px',
                border: '1px solid var(--color-charcoal)',
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--color-surface-one)',
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
              onClick={() => navigate('/shows', { state: { movieId: movie.id } })}
            >
              {/* Image Showcase */}
              <div style={{
                position: 'relative',
                height: '240px',
                width: '100%',
                overflow: 'hidden',
                background: 'var(--color-pure-black)'
              }}>
                <img 
                  src={getMoviePoster(movie)} 
                  alt={movie.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 2
                }}>
                  <span className="pill-tag" style={{ background: 'var(--color-pure-black)', backdropFilter: 'blur(4px)' }}>
                    {movie.genre}
                  </span>
                </div>
              </div>

              {/* Movie Info */}
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-paper-white)',
                  marginBottom: '8px'
                }}>{movie.title}</h3>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  color: 'var(--color-steel)',
                  fontSize: '12px',
                  marginBottom: '12px'
                }}>
                  <span>🌐 {movie.language}</span>
                  <span>⏱️ {movie.duration} min</span>
                </div>

                {movie.description && (
                  <p style={{
                    color: 'var(--color-mid-gray)',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{movie.description}</p>
                )}

                <button className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 16px', fontSize: '13px' }}>
                  🎭 Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;