import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logoImg from '../assets/showsphere_logo.png';

const Navbar = () => {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Search logic that maps to query params on /movies
  const searchVal = new URLSearchParams(location.search).get('search') || '';

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      navigate(`/movies?search=${encodeURIComponent(val)}`);
    } else {
      navigate('/movies');
    }
  };

  return (
    <nav style={{
      background: '#2C2A29', /* Dark Charcoal Navbar background */
      borderBottom: '1px solid #7E6A56', /* Muted Earth border */
      padding: '0 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Premium Logo (Custom Vintage Logo Image & Panchang Font Fallback) */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logoImg} 
            alt="ShowSphere Logo" 
            width="180"
            height="38"
            style={{ 
              height: '38px', 
              width: '180px',
              objectFit: 'contain',
              borderRadius: '4px'
            }} 
          />
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#DDA750', /* Golden Amber */
            letterSpacing: '1px',
            fontFamily: "'Panchang', sans-serif",
            textTransform: 'uppercase',
            display: 'none' /* Handled by image logo */
          }}>ShowSphere</span>
        </div>
      </Link>

      {/* Center Group: Nav Links + Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { path: '/',            label: 'Home'   },
              { path: '/movies',      label: 'Movies' },
              { path: '/shows',       label: 'Shows'  },
              { path: '/my-bookings', label: 'My Bookings' },
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)',
                color: isActive(path) ? '#F5F2EA' : '#E8E3D2',
                background: isActive(path) ? '#4A3525' : 'transparent',
                transition: 'all 0.2s'
              }}>{label}</Link>
            ))}
            {isAdmin() && (
              <Link to="/admin" style={{
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)',
                color: isActive('/admin') ? '#F5F2EA' : '#E8E3D2',
                background: isActive('/admin') ? '#4A3525' : 'transparent',
                transition: 'all 0.2s'
              }}>Admin</Link>
            )}
          </div>
        )}

        {/* Global Search Bar */}
        {user && (
          <input
            type="text"
            placeholder="🔍 Search movies..."
            value={searchVal}
            onChange={handleSearchChange}
            style={{
              background: '#4A3525',
              border: '1px solid #7E6A56',
              color: '#F5F2EA',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '13px',
              outline: 'none',
              width: '220px',
              fontFamily: 'var(--font-inter)'
            }}
          />
        )}
      </div>

      {/* Auth Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#4A3525',
                border: '1px solid #7E6A56',
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '13px',
                color: '#F5F2EA',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DDA750'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#7E6A56'}
              >
                <span style={{ color: '#E8E3D2' }}>👤</span>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {user.name}
                </span>
                {isAdmin() && (
                  <span className="new-badge" style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    marginLeft: '4px',
                    background: '#DDA750',
                    color: '#2C2A29'
                  }}>ADMIN</span>
                )}
              </div>
            </Link>
            <button onClick={handleLogout} className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px', background: '#7E6A56', color: '#F5F2EA', borderColor: '#4A3525' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <span style={{
                color: '#E8E3D2',
                fontSize: '14px',
                marginRight: '16px',
                cursor: 'pointer',
                fontWeight: 'var(--font-weight-medium)'
              }}>Log in</span>
            </Link>
            <Link to="/register">
              <button className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}>
                Start Booking
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;