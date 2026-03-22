import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress, Container, Card
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../lib/api';

export default function RequestAccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const centreIdFromUrl = queryParams.get('centre');

  const [examTypes, setExamTypes] = useState([]);
  const [centres, setCentres] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ 
    full_name: '', role: 'student', email: '', phone: '', 
    exam_interested: '', coaching_centre: '', message: '' 
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, centreRes] = await Promise.all([
          api.get('/exam-types/'),
          api.get('/coaching/centres/')
        ]);
        setExamTypes(examRes.data.results || examRes.data);
        const centresList = centreRes.data.results || centreRes.data;
        setCentres(centresList);
        
        // Auto-select the first centre (for single-centre model)
        if (centresList.length > 0) {
          setForm(prev => ({ ...prev, coaching_centre: String(centresList[0].id) }));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load centres. Please refresh.");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [centreIdFromUrl]);

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.coaching_centre) {
      setError("Please select a coaching centre.");
      return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-access/', form);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? (typeof d === 'object' ? JSON.stringify(d) : d) : 'Submission failed.');
    } finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f1f5f9' }}>
      {/* Left branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '40%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e0546 0%, #4c1d95 100%)',
        p: 6, color: '#fff',
      }}>
        <SchoolIcon sx={{ fontSize: 60, mb: 3 }} />
        <Typography variant="h4" fontWeight={900} mb={2}>EduCoach</Typography>
        <Typography sx={{ opacity: 0.8, textAlign: 'center', maxWidth: 300 }}>
          Join India's leading AI-powered coaching platform.
        </Typography>
      </Box>

      {/* Right form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ width: '100%', maxWidth: 480, p: 4, borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <Typography variant="h5" fontWeight={800} mb={1}>Join a Centre</Typography>
          <Typography color="text.secondary" mb={4} variant="body2">
            Create your account request below.
          </Typography>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>Request Submitted!</Typography>
              <Typography color="text.secondary" mb={3}>The centre admin will review and approve your account.</Typography>
              <Button variant="contained" onClick={() => navigate('/login')} fullWidth>Go to Login</Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <TextField
                fullWidth label="Full Name" margin="normal" value={form.full_name}
                onChange={set('full_name')} required placeholder="Your full name"
              />

              {/* Centre hidden as it is single-centre now */}
              <input type="hidden" name="coaching_centre" value={form.coaching_centre} />

              <TextField
                fullWidth label="Email Address" type="email" margin="normal" value={form.email}
                onChange={set('email')} required
              />
              
              <TextField
                fullWidth label="Phone Number" margin="normal" value={form.phone}
                onChange={set('phone')} required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Exam Interested In</InputLabel>
                <Select value={form.exam_interested} label="Exam Interested In" onChange={set('exam_interested')}>
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              <Button
                fullWidth type="submit" variant="contained" size="large"
                sx={{ mt: 4, py: 1.5, fontWeight: 700, borderRadius: 2 }} 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Now'}
              </Button>
              
              <Button 
                fullWidth variant="text" sx={{ mt: 1 }}
                onClick={() => navigate('/login')}
              >
                Already have an account? Sign In
              </Button>
            </form>
          )}
        </Card>
      </Box>
    </Box>
  );
}
