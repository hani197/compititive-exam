import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../context/AuthContext';

const EXAMS = ['EAMCET', 'DSC', 'Civils', 'Group Services', 'CEEP', 'ECET'];
const COLORS = ['#f97316', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      console.log('Login successful, user role:', user.role);
      
      if (user.role === 'admin' || user.is_staff) {
        window.location.href = '/admin/submissions';
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      const status = err.response?.status;
      const data = err.response?.data;
      const detail = data?.detail || data?.error || JSON.stringify(data);
      setError(`Login Failed (${status || 'Network Error'}): ${detail || 'Invalid username or password.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const res = await api.get('exam-types/');
      alert(`Connection Success! Backend reached. Status: ${res.status}`);
    } catch (err) {
      alert(`Connection Failed! Could not reach backend. Error: ${err.message}\nURL: ${api.defaults.baseURL}exam-types/`);
    }
  };

  const handleResetAdmin = async () => {
    try {
      const resetUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`.replace('/api', '') + '/maintenance/reset-admin/';
      window.open(resetUrl, '_blank');
      setError('Check the new tab for reset status, then try logging in.');
    } catch (err) {
      setError('Could not open reset link.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — vibrant gradient panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '48%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #1e0546 0%, #4c1d95 40%, #7c3aed 75%, #a855f7 100%)',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(168,85,247,0.25)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(249,115,22,0.2)', filter: 'blur(50px)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box sx={{
            width: 80, height: 80, mx: 'auto',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 4, display: 'flex', alignItems: 'center',
            justifyContent: 'center', mb: 3,
          }}>
            <SchoolIcon sx={{ fontSize: 44, color: '#fff' }} />
          </Box>
          <Typography variant="h3" fontWeight={900} color="#fff" mb={1} letterSpacing={-1}>
            EduCoach
          </Typography>
          <Typography color="rgba(255,255,255,0.7)" mb={5} fontSize="1.05rem">
            Competitive Exam Training Platform
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 340 }}>
            {EXAMS.map((exam, i) => (
              <Box key={exam} sx={{
                px: 2.5, py: 1,
                borderRadius: 10,
                background: `${COLORS[i]}30`,
                border: `1.5px solid ${COLORS[i]}60`,
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[i] }} />
                <Typography fontWeight={700} color="#fff" fontSize="0.85rem">{exam}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right — login form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #f5f0ff 0%, #fdf4ff 50%, #fff 100%)',
        p: 3,
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" fontWeight={800} mb={0.5}
            sx={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back!
          </Typography>
          <Typography color="text.secondary" mb={4} fontWeight={500}>
            Sign in to continue your journey
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" margin="normal"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#a78bfa', fontSize: 20 }} /></InputAdornment>,
              }}
            />
            <TextField
              fullWidth label="Password" type={showPass ? 'text' : 'password'} margin="normal"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#a78bfa', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOffIcon fontSize="small" sx={{ color: '#a78bfa' }} /> : <VisibilityIcon fontSize="small" sx={{ color: '#a78bfa' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.6, fontSize: '1rem', borderRadius: 3 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1.5px dashed rgba(167,139,250,0.3)', textAlign: 'center' }}>
            <Typography variant="body2" color="#7c3aed" fontWeight={500} mb={1}>
              Own a coaching centre?{' '}
              <Button size="small" onClick={() => navigate('/register-centre')}
                sx={{ fontWeight: 800, color: '#5b21b6', p: 0, minWidth: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Register here
              </Button>
            </Typography>
            
            <Button 
              size="small" 
              onClick={handleResetAdmin}
              sx={{ color: 'text.secondary', fontSize: '0.7rem', opacity: 0.7, '&:hover': { opacity: 1 } }}
            >
              Emergency: Reset Admin Password
            </Button>
            <Box mt={1.5}>
              <Button 
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleTestConnection}
                sx={{ color: '#7c3aed', borderColor: '#7c3aed', fontSize: '0.75rem', fontWeight: 800, py: 1 }}
              >
                Diagnostic: Test Backend Connection
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
