import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Home            from './pages/Home';
import Movies          from './pages/Movies';
import Shows           from './pages/Shows';
import SeatSelection   from './pages/SeatSelection';
import MyBookings      from './pages/MyBookings';
import AdminDashboard  from './pages/AdminDashboard';
import Profile         from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{
          minHeight: '100vh',
          background: 'var(--color-pure-black)'
        }}>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - Need Login */}
            <Route path="/movies" element={
              <ProtectedRoute>
                <Movies />
              </ProtectedRoute>
            } />

            <Route path="/shows" element={
              <ProtectedRoute>
                <Shows />
              </ProtectedRoute>
            } />

            <Route path="/shows/:showId/seats" element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            } />

            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />

            {/* Admin Only Route */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--color-surface-one)',
              color: 'var(--color-paper-white)',
              border: '1px solid var(--color-charcoal)'
            },
            success: {
              iconTheme: {
                primary: 'var(--color-border-strong)',
                secondary: 'var(--color-pure-black)'
              }
            },
            error: {
              iconTheme: {
                primary: '#e50914',
                secondary: '#ffffff'
              }
            }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;