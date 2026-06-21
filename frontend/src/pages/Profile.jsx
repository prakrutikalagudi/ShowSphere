import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, deleteProfile } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loginUser, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '' // Keep empty unless updating
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password || ''
      };
      
      const res = await updateProfile(payload);
      const { token, email, name, role } = res.data.data;
      
      loginUser({ email, name, role }, token);
      toast.success('Profile updated successfully! ✨');
      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      '⚠ WARNING: Are you absolutely sure you want to delete your ShowSphere account? All your booked tickets will be cancelled. This action is permanent.'
    );
    if (!confirm) return;

    setDeleting(true);
    try {
      await deleteProfile();
      logoutUser();
      toast.success('Your ShowSphere account was deleted. Goodbye! 🎬');
      navigate('/register');
    } catch (err) {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: '640px' }}>
      {/* Two-Tone Section Header */}
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <h1 style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-paper-white)',
          marginBottom: '4px'
        }}>
          Update Profile 
        </h1>
        <p style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-mid-gray)'
        }}>
          
        </p>
      </div>

      {/* Profile Update Panel */}
      <div className="card" style={{
        background: 'var(--color-surface-one)',
        border: '1px solid var(--color-fog)',
        borderRadius: '10px',
        padding: '32px',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-paper-white)',
          marginBottom: '24px'
        }}>
          General Information
        </h2>

        <form onSubmit={handleUpdate}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '32px' }}>
            <label>New Password (Optional)</label>
            <input
              type="password"
              name="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={handleChange}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-steel)', marginTop: '4px' }}>
              Must be at least 6 characters if you wish to change it.
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
          >
            {loading ? 'Saving updates...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{
        background: 'rgba(229, 9, 20, 0.03)',
        border: '1px solid rgba(229, 9, 20, 0.15)',
        borderRadius: '10px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-weight-semibold)', color: '#e50914', marginBottom: '4px' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-steel)', maxWidth: '380px' }}>
            Deleting your account will purge all personal bookings and seat reservations instantly.
          </p>
        </div>
        
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="btn-outline"
          style={{
            borderColor: 'rgba(229, 9, 20, 0.4)',
            color: '#e50914',
            background: 'transparent',
            padding: '8px 16px',
            fontSize: '13px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.08)';
            e.currentTarget.style.borderColor = '#e50914';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
          }}
        >
          {deleting ? 'Purging Account...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
