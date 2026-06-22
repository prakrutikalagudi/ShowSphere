import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);
      const { token, email, name, role } = res.data.data;
      loginUser({ email, name, role }, token);
      toast.success(`Welcome back, ${name}! 🎬`);
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      width: '100%',
      backgroundImage: "url('/vintage_cinema_screen.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }} className="fade-in">
      
      {/* Dark overlay */}
      <div 
        className="auth-overlay-mobile-fix"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(44, 42, 41, 0.15)',
          zIndex: 1
        }} 
      />

      {/* Login Card (Fits inside the projector screen of the background image) */}
      <div 
        className="auth-card-mobile-fix"
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '-22%', /* Align with the projector screen */
          marginLeft: '19%', /* Align with the projector screen */
          width: '38%',
          maxWidth: '380px',
          minWidth: '290px',
          padding: '16px 20px',
          background: 'transparent', /* Completely transparent */
          border: 'none',
          boxShadow: 'none',
          textAlign: 'left'
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-paper-white)',
            fontFamily: "'Panchang', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}>
            Sign In
          </h2>
          {/* <p style={{ color: 'var(--color-steel)', fontSize: '11px' }}>
            Project your ShowSphere session
          </p> */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@email.com"
              value={form.email}
              onChange={handleChange}
              style={{ padding: '8px 12px', fontSize: '13px' }}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '12px', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              style={{ padding: '8px 12px', fontSize: '13px' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '10px',
              fontSize: '13px'
            }}
          >
            {loading ? '⏳ Signing...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'left',
          marginTop: '16px',
          color: 'var(--color-paper-white)',
          fontSize: '12px'
        }}>
          New viewer?{' '}
          <Link to="/register" style={{
            color: 'var(--color-electric-blue)',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;