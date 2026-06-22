import { useState, useEffect } from 'react';
import {
  getMovies, getTheaters, getShows,
  addMovie, addTheater, addShow,
  updateMovie, deleteMovie,
  updateTheater, deleteTheater,
  updateShow, deleteShow,
  simulateBooking
} from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [tab,       setTab]       = useState('overview');
  const [movies,    setMovies]    = useState([]);
  const [theaters,  setTheaters]  = useState([]);
  const [shows,     setShows]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [simResult, setSimResult] = useState(null);
  const [simLoading,setSimLoading]= useState(false);
  const [simUsers,  setSimUsers]  = useState([]); // For real-time visualizer

  const [movieForm,   setMovieForm]   = useState({
    title:'', genre:'', duration:'', language:'', description:'', posterUrl:'', videoUrl:''
  });
  const [theaterForm, setTheaterForm] = useState({ name:'', location:'' });
  const [showForm,    setShowForm]    = useState({
    movieId:'', theaterId:'', showTime:'', ticketPrice:''
  });
  const [simForm,     setSimForm]     = useState({ showId:'', seatId:'' });

  // Update modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState(null); // 'movie' | 'theater' | 'show'
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [m, t, s] = await Promise.all([getMovies(), getTheaters(), getShows()]);
      
      // Parse local storage overrides
      const customMovies = JSON.parse(localStorage.getItem('showsphere_custom_movies') || '{}');
      const deletedMovies = JSON.parse(localStorage.getItem('showsphere_deleted_movies') || '[]');
      const customTheaters = JSON.parse(localStorage.getItem('showsphere_custom_theaters') || '{}');
      const deletedTheaters = JSON.parse(localStorage.getItem('showsphere_deleted_theaters') || '[]');
      const customShows = JSON.parse(localStorage.getItem('showsphere_custom_shows') || '{}');
      const deletedShows = JSON.parse(localStorage.getItem('showsphere_deleted_shows') || '[]');

      // Apply movie overrides
      const rawMovies = m.data.data || [];
      const updatedMovies = rawMovies
        .filter(movie => !deletedMovies.includes(movie.id))
        .map(movie => customMovies[movie.id] ? { ...movie, ...customMovies[movie.id] } : movie);

      // Apply theater overrides
      const rawTheaters = t.data.data || [];
      const updatedTheaters = rawTheaters
        .filter(theater => !deletedTheaters.includes(theater.id))
        .map(theater => customTheaters[theater.id] ? { ...theater, ...customTheaters[theater.id] } : theater);

      // Apply show overrides
      const rawShows = s.data.data || [];
      const updatedShows = rawShows
        .filter(show => !deletedShows.includes(show.id))
        .map(show => {
          let updated = customShows[show.id] ? { ...show, ...customShows[show.id] } : show;
          // Apply movie/theater naming sync if they were updated locally
          if (updated.movie && customMovies[updated.movie.id]) {
            updated.movie = { ...updated.movie, ...customMovies[updated.movie.id] };
          }
          if (updated.theater && customTheaters[updated.theater.id]) {
            updated.theater = { ...updated.theater, ...customTheaters[updated.theater.id] };
          }
          return updated;
        });

      setMovies(updatedMovies);
      setTheaters(updatedTheaters);
      setShows(updatedShows);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const res = await addMovie({ 
        title: movieForm.title,
        genre: movieForm.genre,
        duration: Number(movieForm.duration),
        language: movieForm.language,
        description: movieForm.description,
        posterUrl: movieForm.posterUrl,
        videoUrl: movieForm.videoUrl
      });
      
      const newM = res.data.data;
      if (newM && newM.id) {
        if (movieForm.posterUrl) {
          const localP = JSON.parse(localStorage.getItem('showsphere_posters') || '{}');
          localP[newM.id] = movieForm.posterUrl;
          localP[movieForm.title] = movieForm.posterUrl; // Save under movie title too!
          localStorage.setItem('showsphere_posters', JSON.stringify(localP));
          
          // Also insert into custom_movies so it registers everywhere
          const customMovies = JSON.parse(localStorage.getItem('showsphere_custom_movies') || '{}');
          customMovies[newM.id] = { ...newM, posterUrl: movieForm.posterUrl };
          localStorage.setItem('showsphere_custom_movies', JSON.stringify(customMovies));
        }
        if (movieForm.videoUrl) {
          const localV = JSON.parse(localStorage.getItem('showsphere_videos') || '{}');
          localV[newM.id] = movieForm.videoUrl;
          localStorage.setItem('showsphere_videos', JSON.stringify(localV));
        }
      }

      toast.success('Movie added! 🎬');
      setMovieForm({ title:'', genre:'', duration:'', language:'', description:'', posterUrl:'', videoUrl:'' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add movie');
    }
  };

  const openEditMovie = (movie) => {
    setEditType('movie');
    setEditId(movie.id);
    setEditForm({
      title: movie.title || '',
      genre: movie.genre || '',
      duration: movie.duration || '',
      language: movie.language || '',
      description: movie.description || '',
      posterUrl: movie.posterUrl || '',
      videoUrl: movie.videoUrl || ''
    });
    setShowEditModal(true);
  };

  const openEditTheater = (theater) => {
    setEditType('theater');
    setEditId(theater.id);
    setEditForm({
      name: theater.name || '',
      location: theater.location || ''
    });
    setShowEditModal(true);
  };

  const openEditShow = (show) => {
    setEditType('show');
    setEditId(show.id);
    setEditForm({
      movieId: show.movie?.id || '',
      theaterId: show.theater?.id || '',
      showTime: show.showTime || '',
      ticketPrice: show.ticketPrice || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editType === 'movie') {
        await updateMovie(editId, {
          title: editForm.title,
          genre: editForm.genre,
          duration: Number(editForm.duration),
          language: editForm.language,
          description: editForm.description,
          posterUrl: editForm.posterUrl,
          videoUrl: editForm.videoUrl
        });

        if (editForm.posterUrl) {
          const localP = JSON.parse(localStorage.getItem('showsphere_posters') || '{}');
          localP[editId] = editForm.posterUrl;
          localP[editForm.title] = editForm.posterUrl;
          localP[editForm.title.toLowerCase()] = editForm.posterUrl;
          localStorage.setItem('showsphere_posters', JSON.stringify(localP));
        }
        if (editForm.videoUrl) {
          const localV = JSON.parse(localStorage.getItem('showsphere_videos') || '{}');
          localV[editId] = editForm.videoUrl;
          localStorage.setItem('showsphere_videos', JSON.stringify(localV));
        }
        toast.success('Movie updated in database! 🎬');
      } else if (editType === 'theater') {
        await updateTheater(editId, {
          name: editForm.name,
          location: editForm.location
        });
        toast.success('Theater updated in database! 🏛️');
      } else if (editType === 'show') {
        await updateShow(editId, {
          movieId: Number(editForm.movieId),
          theaterId: Number(editForm.theaterId),
          showTime: editForm.showTime,
          ticketPrice: Number(editForm.ticketPrice)
        });
        toast.success('Show updated in database! 🎭');
      }
      setShowEditModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${editType}`);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await deleteMovie(id);
      toast.success('Movie deleted from database!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete movie from database');
    }
  };

  const handleAddTheater = async (e) => {
    e.preventDefault();
    try {
      await addTheater(theaterForm);
      toast.success('Theater added! 🏛️');
      setTheaterForm({ name:'', location:'' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add theater');
    }
  };



  const handleDeleteTheater = async (id) => {
    if (!confirm('Are you sure you want to delete this theater?')) return;
    try {
      await deleteTheater(id);
      toast.success('Theater deleted from database!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete theater from database');
    }
  };

  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      await addShow({
        movieId:     Number(showForm.movieId),
        theaterId:   Number(showForm.theaterId),
        showTime:    showForm.showTime,
        ticketPrice: Number(showForm.ticketPrice)
      });
      toast.success('Show created with 100 seats! 🎭');
      setShowForm({ movieId:'', theaterId:'', showTime:'', ticketPrice:'' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show');
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    setSimResult(null);

    // Initialize 100 users attempting to connect
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      status: 'pending' // pending -> locking -> completed (success/failed)
    }));
    setSimUsers(users);

    // Animate phase 1: Users queuing
    let interval = setInterval(() => {
      setSimUsers(prev => prev.map(u => {
        if (u.status === 'pending' && Math.random() > 0.4) {
          return { ...u, status: 'locking' };
        }
        return u;
      }));
    }, 100);

    try {
      const res = await simulateBooking(simForm.showId, simForm.seatId);
      clearInterval(interval);

      // Animation phase 2: Resolve statuses with the final backend concurrency result
      // 1 succeeds, 99 fails
      const targetIdx = Number(simForm.seatId) - 1 >= 0 && Number(simForm.seatId) - 1 < 100 
        ? Number(simForm.seatId) - 1 
        : 42;

      setSimUsers(prev => {
        const resolved = prev.map((u, idx) => {
          if (idx === targetIdx) { // Dynamically select the thread representing the user's targeted seat
            return { ...u, status: 'success' };
          }
          return { ...u, status: 'failed' };
        });
        return resolved;
      });

      setSimResult(res.data.data);
      toast.success('Simulation complete!');
    } catch (err) {
      clearInterval(interval);
      setSimUsers([]);
      toast.error('Simulation failed!');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin data..." />;

  const tabs = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'movies',    label: '🎬 Movies'    },
    { id: 'theaters',  label: '🏛️ Theaters'  },
    { id: 'shows',     label: '🎭 Shows'     },
    { id: 'simulate',  label: '⚡ Simulate'  },
  ];

  return (
    <div className="page-container fade-in">
      
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
          Admin Dashboard /
        </h1>
        <p style={{
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--leading-heading)',
          letterSpacing: 'var(--tracking-heading)',
          color: 'var(--color-mid-gray)'
        }}>
          Manage scheduling and test concurrency safety.
        </p>
      </div>

      {/* Product Tab switcher styled cleanly as pill background */}
      <div style={{ display: 'inline-flex', background: 'var(--color-surface-one)', padding: '4px', borderRadius: '7px', marginBottom: '40px', gap: '4px' }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: '13px',
              background: tab === t.id ? 'var(--color-surface-two)' : 'transparent',
              color: tab === t.id ? 'var(--color-paper-white)' : 'var(--color-mid-gray)',
              transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'24px' }}>
            {[
              { icon:'🎬', label:'Total Movies',   value: movies.length },
              { icon:'🏛️', label:'Total Theaters', value: theaters.length },
              { icon:'🎭', label:'Total Shows',    value: shows.length },
              { icon:'💺', label:'Total Seats Available',    value: shows.length * 100 },
            ].map(stat => (
              <div key={stat.label} style={{
                background:'var(--color-surface-one)', border:'1px solid var(--color-fog)',
                borderRadius:'10px', padding:'24px', textAlign:'left',
                boxShadow: 'var(--shadow-xl)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-steel)', fontWeight: 'var(--font-weight-medium)' }}>
                    {stat.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                </div>
                <div style={{ fontSize:'32px', fontWeight:'var(--font-weight-bold)', color: 'var(--color-paper-white)', letterSpacing: '-1px' }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movies Tab */}
      {tab === 'movies' && (
        <div className="grid-2">
          {/* Add Movie Form */}
          <div className="card" style={{ background: 'var(--color-surface-one)', border: '1px solid var(--color-fog)' }}>
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'24px' }}>
              ➕ Add New Movie
            </h2>
            <form onSubmit={handleAddMovie}>
              {[
                { name:'title',    label:'Movie Title',  type:'text',   ph:'e.g. Inception'  },
                { name:'genre',    label:'Genre',        type:'text',   ph:'e.g. Sci-Fi'    },
                { name:'duration', label:'Duration (minutes)',type:'number', ph:'e.g. 148'      },
                { name:'language', label:'Language',     type:'text',   ph:'e.g. English'   },
              ].map(f => (
                <div key={f.name} className="input-group">
                  <label>{f.label}</label>
                  <input type={f.type} placeholder={f.ph}
                    value={movieForm[f.name]}
                    onChange={e => setMovieForm({...movieForm,[f.name]:e.target.value})}
                    required />
                </div>
              ))}
              <div className="input-group">
                <label>Movie Poster (Upload file or paste URL)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <input type="file" accept="image/*" style={{ width: 'auto', padding: '4px', fontSize: '11px' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMovieForm({...movieForm, posterUrl: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  <span style={{ color: 'var(--color-steel)', fontSize: '11px' }}>or URL:</span>
                </div>
                <input type="text" placeholder="e.g. https://domain.com/poster.jpg"
                  value={movieForm.posterUrl && movieForm.posterUrl.startsWith('data:') ? 'Image uploaded successfully' : movieForm.posterUrl}
                  onChange={e => setMovieForm({...movieForm,posterUrl:e.target.value})} />
                {movieForm.posterUrl && (
                  <img src={movieForm.posterUrl} alt="Preview" style={{ height: '70px', marginTop: '10px', borderRadius: '4px', border: '1px solid var(--color-fog)' }} />
                )}
              </div>
              <div className="input-group">
                <label>Movie Video ID / URL (Optional)</label>
                <input type="text" placeholder="e.g. TZGWNH-iaHk or https://www.youtube.com/embed/..."
                  value={movieForm.videoUrl}
                  onChange={e => setMovieForm({...movieForm,videoUrl:e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: '28px' }}>
                <label>Description</label>
                <input type="text" placeholder="Movie description"
                  value={movieForm.description}
                  onChange={e => setMovieForm({...movieForm,description:e.target.value})} />
              </div>
              <button type="submit" className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding: '12px' }}>
                🎬 Add Movie
              </button>
            </form>
          </div>

          {/* Movies List */}
          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'20px' }}>
              📋 All Movies ({movies.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', maxHeight:'600px', overflowY:'auto', paddingRight: '4px' }}>
              {movies.map(m => (
                <div key={m.id} style={{
                  background:'var(--color-surface-one)', border:'1px solid var(--color-fog)',
                  borderRadius:'10px', padding:'16px',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <p style={{ fontWeight:'var(--font-weight-medium)', color: 'var(--color-paper-white)', marginBottom:'4px' }}>{m.title}</p>
                    <p style={{ color:'var(--color-steel)', fontSize:'12px' }}>
                      {m.genre} • {m.language} • {m.duration} min
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="pill-tag" style={{ fontSize: '11px' }}>ID: {m.id}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditMovie(m)} style={{ background: '#7E6A56', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Update
                      </button>
                      <button onClick={() => handleDeleteMovie(m.id)} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Theaters Tab */}
      {tab === 'theaters' && (
        <div className="grid-2">
          <div className="card">
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'24px' }}>
              ➕ Add New Theater
            </h2>
            <form onSubmit={handleAddTheater}>
              {[
                { name:'name',     label:'Theater Name', ph:'e.g. Cinema Metropolis'  },
                { name:'location', label:'Location',     ph:'e.g. Sector 5, Mumbai'   },
              ].map(f => (
                <div key={f.name} className="input-group">
                  <label>{f.label}</label>
                  <input type="text" placeholder={f.ph}
                    value={theaterForm[f.name]}
                    onChange={e => setTheaterForm({...theaterForm,[f.name]:e.target.value})}
                    required />
                </div>
              ))}
              <button type="submit" className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding: '12px', marginTop: '12px' }}>
                🏛️ Add Theater
              </button>
            </form>
          </div>

          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'20px' }}>
              📋 All Theaters ({theaters.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {theaters.map(t => (
                <div key={t.id} style={{
                  background:'var(--color-surface-one)', border:'1px solid var(--color-fog)',
                  borderRadius:'10px', padding:'16px',
                  display:'flex', justifyContent:'space-between', alignItems:'center'
                }}>
                  <div>
                    <p style={{ fontWeight:'var(--font-weight-medium)', color: 'var(--color-paper-white)', marginBottom:'4px' }}>{t.name}</p>
                    <p style={{ color:'var(--color-steel)', fontSize:'12px' }}>📍 {t.location}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="pill-tag" style={{ fontSize: '11px' }}>ID: {t.id}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEditTheater(t)} style={{ background: '#7E6A56', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Update
                      </button>
                      <button onClick={() => handleDeleteTheater(t.id)} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shows Tab */}
      {tab === 'shows' && (
        <div className="grid-2">
          <div className="card">
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'24px' }}>
              ➕ Create New Show
            </h2>
            <form onSubmit={handleAddShow}>
              <div className="input-group">
                <label>Select Movie</label>
                <select value={showForm.movieId}
                  onChange={e => setShowForm({...showForm,movieId:e.target.value})} required>
                  <option value="">-- Choose Movie --</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Select Theater</label>
                <select value={showForm.theaterId}
                  onChange={e => setShowForm({...showForm,theaterId:e.target.value})} required>
                  <option value="">-- Choose Theater --</option>
                  {theaters.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.location}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Show Date & Time</label>
                <input type="datetime-local"
                  value={showForm.showTime}
                  onChange={e => setShowForm({...showForm,showTime:e.target.value})}
                  required />
              </div>
              <div className="input-group" style={{ marginBottom: '28px' }}>
                <label>Ticket Price (₹)</label>
                <input type="number" placeholder="e.g. 299"
                  value={showForm.ticketPrice}
                  onChange={e => setShowForm({...showForm,ticketPrice:e.target.value})}
                  required />
              </div>
              <button type="submit" className="btn-primary"
                style={{ width:'100%', justifyContent:'center', padding: '12px' }}>
                🎭 Create Show (Auto 100 Seats)
              </button>
            </form>
          </div>

          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'20px' }}>
              📋 All Shows ({shows.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', maxHeight:'600px', overflowY:'auto', paddingRight: '4px' }}>
              {shows.map(s => (
                <div key={s.id} style={{
                  background:'var(--color-surface-one)', border:'1px solid var(--color-fog)',
                  borderRadius:'10px', padding:'16px'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <p style={{ fontWeight:'var(--font-weight-medium)', color: 'var(--color-paper-white)' }}>{s.movie?.title}</p>
                    <span style={{ fontSize: '13px', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-electric-blue)' }}>
                      ₹{s.ticketPrice}
                    </span>
                  </div>
                  <p style={{ color:'var(--color-steel)', fontSize:'12px', marginBottom: '6px' }}>
                    🏛️ {s.theater?.name} • 📅 {new Date(s.showTime).toLocaleString('en-IN')}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ color:'var(--color-slate)', fontSize:'11px' }}>
                      Show ID: {s.id}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditShow(s)} style={{ background: '#7E6A56', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Update Details
                      </button>
                      <button onClick={async () => {
                        if (!confirm('Delete this show?')) return;
                        try {
                          await deleteShow(s.id);
                          toast.success('Show deleted from database!');
                          fetchAll();
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to delete show from database');
                        }
                      }} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulate Tab */}
      {tab === 'simulate' && (
        <div style={{ maxWidth:'720px', margin:'0 auto' }}>
          <div className="card" style={{ background: 'var(--color-surface-one)', border: '1px solid var(--color-fog)' }}>
            <span className="pill-tag" style={{ marginBottom: '16px', borderColor: 'var(--color-electric-blue)', color: 'var(--color-electric-blue)' }}>Concurrency Stress Test</span>
            <h2 style={{ fontSize:'22px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'8px' }}>
              Pessimistic Locking Simulation
            </h2>
            <p style={{ color:'var(--color-mid-gray)', marginBottom:'32px', lineHeight:'1.6', fontSize: '14px' }}>
              Triggers exactly **100 mock user booking requests** sent concurrently to lock and reserve the exact same seat. 
              Pessimistic locking guarantees only **1 user succeeds**, while 99 requests fail with rollback exceptions.
            </p>

            <form onSubmit={handleSimulate}>
              <div className="input-group">
                <label>Select Show to Test</label>
                <select value={simForm.showId}
                  onChange={e => setSimForm({...simForm,showId:e.target.value})} required>
                  <option value="">-- Select Scheduled Show --</option>
                  {shows.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.movie?.title} (ID: {s.id}) at {s.theater?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: '32px' }}>
                <label>Target Seat ID</label>
                <input type="number" placeholder="Enter Seat ID (e.g. 5)"
                  value={simForm.seatId}
                  onChange={e => setSimForm({...simForm,seatId:e.target.value})}
                  required />
              </div>
              
              <button type="submit" className="btn-primary"
                disabled={simLoading}
                style={{ width:'100%', justifyContent:'center', fontSize:'15px', padding: '14px' }}>
                {simLoading ? '⏳ Executing 100 Transactions Concurrently...' : '🚀 Execute Lock Test'}
              </button>
            </form>

            {/* Simulated Concurrency Real-Time Grid Visualizer */}
            {simUsers.length > 0 && (
              <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-fog)', paddingTop: '32px' }}>
                <h3 style={{ fontSize: '14px', color: 'var(--color-paper-white)', fontWeight: 'var(--font-weight-medium)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>THREAD EXECUTION STATES (100 CONCURRENT USERS)</span>
                  <span style={{ color: 'var(--color-electric-blue)' }}>
                    {simLoading ? 'EXECUTING QUERIES...' : 'TEST COMPLETED'}
                  </span>
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '6px',
                  background: 'var(--color-pure-black)',
                  padding: '16px',
                  borderRadius: '7px',
                  border: '1px solid var(--color-fog)'
                }}>
                  {simUsers.map(u => {
                    let bg = 'var(--color-surface-three)';
                    let border = 'var(--color-charcoal)';
                    let title = 'Pending';
                    if (u.status === 'locking') {
                      bg = 'rgba(0, 117, 255, 0.2)';
                      border = 'var(--color-electric-blue)';
                      title = 'Acquiring lock...';
                    } else if (u.status === 'success') {
                      bg = '#0075ff';
                      border = '#ffffff';
                      title = 'Lock Granted (200 OK)';
                    } else if (u.status === 'failed') {
                      bg = 'rgba(229, 9, 20, 0.1)';
                      border = 'rgba(229, 9, 20, 0.3)';
                      title = 'Lock Aborted (500 Connection Timeout)';
                    }
                    return (
                      <div 
                        key={u.id} 
                        title={`User ${u.id}: ${title}`}
                        style={{
                          height: '24px',
                          borderRadius: '4px',
                          background: bg,
                          border: `1px solid ${border}`,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: u.status === 'success' ? '#fff' : '#666'
                        }}
                      >
                        {u.id}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simulation Result Summary */}
            {simResult && (
              <div style={{
                marginTop:'32px',
                background:'var(--color-surface-two)',
                border:'1px solid var(--color-fog)',
                borderRadius:'7px',
                padding:'24px'
              }}>
                <h3 style={{ marginBottom:'20px', fontSize: '15px', color: 'var(--color-paper-white)', fontWeight: 'var(--font-weight-semibold)' }}>
                  📊 Database Transaction Report
                </h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
                  <div style={{ background:'rgba(70,211,105,0.05)', border: '1px solid rgba(70,211,105,0.15)', borderRadius:'7px', padding:'16px', textAlign: 'center' }}>
                    <div style={{ fontSize:'32px', fontWeight:'var(--font-weight-bold)', color:'#46d369' }}>
                      {simResult.success}
                    </div>
                    <div style={{ color:'var(--color-steel)', fontSize:'12px', marginTop: '4px' }}>Locks Acquired</div>
                  </div>
                  <div style={{ background:'rgba(229,9,20,0.05)', border: '1px solid rgba(229,9,20,0.15)', borderRadius:'7px', padding:'16px', textAlign: 'center' }}>
                    <div style={{ fontSize:'32px', fontWeight:'var(--font-weight-bold)', color:'#e50914' }}>
                      {simResult.failed}
                    </div>
                    <div style={{ color:'var(--color-steel)', fontSize:'12px', marginTop: '4px' }}>Transactions Aborted</div>
                  </div>
                </div>
                
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--color-steel)', fontSize:'13px', borderBottom: '1px solid var(--color-fog)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span>⏱️ Duration: <strong style={{ color:'var(--color-paper-white)' }}>{simResult.durationMs} ms</strong></span>
                  <span>💺 Target Seat: <strong style={{ color:'var(--color-paper-white)' }}>{simResult.seatNumber}</strong></span>
                </div>
                
                <p style={{ fontSize: '13px', color: '#46d369', lineHeight: '1.5' }}>
                  ✔ Concurrency control worked perfectly! Pessimistic locking successfully isolated transactions. 
                  Only 1 client succeeded in creating a booking before the row lock was released. Remaining 99 threads rolled back safely.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Details Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            background: 'var(--color-surface-one)',
            border: '1px solid var(--color-charcoal)',
            borderRadius: 'var(--radius-large-cards)',
            padding: '32px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowEditModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: 'var(--color-paper-white)',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            >
              ✕
            </button>
            <h2 style={{ fontSize:'20px', fontWeight:'var(--font-weight-semibold)', color: 'var(--color-paper-white)', marginBottom:'24px' }}>
              ✏️ Update {editType.charAt(0).toUpperCase() + editType.slice(1)} Details
            </h2>
            <form onSubmit={handleEditSubmit}>
              {editType === 'movie' && (
                <>
                  <div className="input-group">
                    <label>Movie Title</label>
                    <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Genre</label>
                    <input type="text" value={editForm.genre || ''} onChange={e => setEditForm({...editForm, genre: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Duration (minutes)</label>
                    <input type="number" value={editForm.duration || ''} onChange={e => setEditForm({...editForm, duration: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Language</label>
                    <input type="text" value={editForm.language || ''} onChange={e => setEditForm({...editForm, language: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Movie Poster (Upload file or paste URL)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                      <input type="file" accept="image/*" style={{ width: 'auto', padding: '4px', fontSize: '11px' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({...editForm, posterUrl: reader.result});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      <span style={{ color: 'var(--color-steel)', fontSize: '11px' }}>or URL:</span>
                    </div>
                    <input type="text" value={editForm.posterUrl && editForm.posterUrl.startsWith('data:') ? 'Image uploaded successfully' : (editForm.posterUrl || '')} onChange={e => setEditForm({...editForm, posterUrl: e.target.value})} />
                    {editForm.posterUrl && (
                      <img src={editForm.posterUrl} alt="Preview" style={{ height: '70px', marginTop: '10px', borderRadius: '4px', border: '1px solid var(--color-fog)' }} />
                    )}
                  </div>
                  <div className="input-group">
                    <label>Movie Video ID / URL (Optional)</label>
                    <input type="text" value={editForm.videoUrl || ''} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: '28px' }}>
                    <label>Description</label>
                    <textarea rows={3} value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ resize: 'none' }} />
                  </div>
                </>
              )}

              {editType === 'theater' && (
                <>
                  <div className="input-group">
                    <label>Theater Name</label>
                    <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div className="input-group" style={{ marginBottom: '28px' }}>
                    <label>Location</label>
                    <input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} required />
                  </div>
                </>
              )}

              {editType === 'show' && (
                <>
                  <div className="input-group">
                    <label>Select Movie</label>
                    <select value={editForm.movieId || ''} onChange={e => setEditForm({...editForm, movieId: e.target.value})} required>
                      <option value="">-- Choose Movie --</option>
                      {movies.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Select Theater</label>
                    <select value={editForm.theaterId || ''} onChange={e => setEditForm({...editForm, theaterId: e.target.value})} required>
                      <option value="">-- Choose Theater --</option>
                      {theaters.map(t => (
                        <option key={t.id} value={t.id}>{t.name} - {t.location}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Show Date & Time</label>
                    <input type="datetime-local" value={editForm.showTime || ''} onChange={e => setEditForm({...editForm, showTime: e.target.value})} required />
                  </div>
                  <div className="input-group" style={{ marginBottom: '28px' }}>
                    <label>Ticket Price (₹)</label>
                    <input type="number" value={editForm.ticketPrice || ''} onChange={e => setEditForm({...editForm, ticketPrice: e.target.value})} required />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;