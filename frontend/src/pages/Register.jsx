import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      const res = await register(form);
      const { token, email, name, role } = res.data.data;
      loginUser({ email, name, role }, token);
      toast.success(`Welcome, ${name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      
      {/* Dark overlay */}
      <div className="auth-overlay" />

      {/* Register Card (Fits inside the projector screen of the background image) */}
      <div className="auth-card">
        <div style={{ marginBottom: '10px' }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-paper-white)',
            fontFamily: "'Panchang', sans-serif",
            textTransform: 'uppercase',
            marginBottom: '2px'
          }}>
            Create Account
          </h2>
          {/* <p style={{ color: 'var(--color-steel)', fontSize: '10px' }}>
            Register to join the theater session
          </p> */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', fontWidth: '2px', marginBottom: '2px' }}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              style={{ padding: '6px 10px', fontSize: '12px' }}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', marginBottom: '2px' }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={handleChange}
              style={{ padding: '6px 10px', fontSize: '12px' }}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', marginBottom: '2px' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              style={{ padding: '6px 10px', fontSize: '12px' }}
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
              padding: '8px',
              fontSize: '12px'
            }}
          >
            {loading ? '⏳ Creating...' : 'Register'}
          </button>
        </form>

        <p style={{
          textAlign: 'left',
          marginTop: '10px',
          color: 'var(--color-paper-white)',
          fontSize: '11px'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: 'var(--color-electric-blue)',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;