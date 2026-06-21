import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:',
      error.response?.status,
      error.response?.data,
      error.config?.url
    );

    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing storage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────
export const register = (data) =>
  API.post('/auth/register', data);

export const login = (data) =>
  API.post('/auth/login', data);

export const updateProfile = (data) =>
  API.put('/auth/profile', data);

export const deleteProfile = () =>
  API.delete('/auth/profile');

// ─── Movies ─────────────────────────────
export const getMovies = () =>
  API.get('/movies');

export const addMovie = (data) =>
  API.post('/movies', data);

export const updateMovie = (id, data) =>
  API.put(`/movies/${id}`, data);

export const deleteMovie = (id) =>
  API.delete(`/movies/${id}`);

export const getMovie = (id) =>
  API.get(`/movies/${id}`);

// ─── Theaters ───────────────────────────
export const getTheaters = () =>
  API.get('/theaters');

export const addTheater = (data) =>
  API.post('/theaters', data);

export const updateTheater = (id, data) =>
  API.put(`/theaters/${id}`, data);

export const deleteTheater = (id) =>
  API.delete(`/theaters/${id}`);

// ─── Shows ──────────────────────────────
export const getShows = () =>
  API.get('/shows');

export const addShow = (data) =>
  API.post('/shows', data);

export const updateShow = (id, data) =>
  API.put(`/shows/${id}`, data);

export const deleteShow = (id) =>
  API.delete(`/shows/${id}`);

export const getShow = (id) =>
  API.get(`/shows/${id}`);

// ─── Seats ──────────────────────────────
export const getSeatsByShow = (showId) =>
  API.get(`/shows/${showId}/seats`);

// ─── Bookings ───────────────────────────
export const bookSeat = (data) =>
  API.post('/bookings', data);

export const getMyBookings = () =>
  API.get('/bookings/my');

// ─── Simulation ─────────────────────────
export const simulateBooking = (showId, seatId) =>
  API.post(
    `/simulation/book-same-seat?showId=${showId}&seatId=${seatId}`
  );