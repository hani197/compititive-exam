import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, Card, CardContent, Grid
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../lib/api';

export default function RegisterCentrePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    role: 'coaching_centre',
    email: '',
    phone: '',
    centre_name: '',
    centre_address: '',
    city: '',
    state: '',
    pincode: '',
    username: '',
    password: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-access/', form);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? JSON.stringify(d) : 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9', p: 3 }}>
        <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Request Submitted!</Typography>
          <Typography color="text.secondary" mb={4}>
            Thank you for registering <strong>{form.centre_name}</strong>. 
            Our admin team will review your application and contact you soon.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} fullWidth>
            Back to Login
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc' }}>
      {/* Branding Sidebar */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '35%',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        p: 6, color: '#fff',
      }}>
        <Typography variant="h3" fontWeight={800} mb={3}>Partner with EduCoach</Typography>
        <Typography variant="h6" sx={{ opacity: 0.8, mb: 4, fontWeight: 400 }}>
          Take your coaching centre digital with AI-powered exam tools.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            { t: 'Custom Branding', d: 'Get a dedicated portal for your students.' },
            { t: 'AI Paper Generation', d: 'Generate practice papers in seconds.' },
            { t: 'Staff Management', d: 'Add instructors and track their classes.' },
            { t: 'Performance Tracking', d: 'Get detailed insights into student progress.' }
          ].map(f => (
            <Box key={f.t}>
              <Typography variant="subtitle1" fontWeight={700} color="#38bdf8">{f.t}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>{f.d}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Registration Form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Card sx={{ maxWidth: 600, width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography variant="h5" fontWeight={700} mb={1}>Register Your Centre</Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Provide your centre details to start the onboarding process.
            </Typography>

            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>CENTRE INFORMATION</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Coaching Centre Name" required
                    value={form.centre_name} onChange={set('centre_name')}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth label="City" required
                    value={form.city} onChange={set('city')}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="State" required
                    value={form.state} onChange={set('state')}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth label="Pincode" required
                    value={form.pincode} onChange={set('pincode')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Full Address" multiline rows={2}
                    value={form.centre_address} onChange={set('centre_address')}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'primary.main', fontWeight: 700 }}>LOGIN CREDENTIALS</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Username" required
                    value={form.username} onChange={set('username')}
                    placeholder="Used for login"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Password" type="password" required
                    value={form.password} onChange={set('password')}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'primary.main', fontWeight: 700 }}>CONTACT PERSON</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Contact Person Name" required
                    value={form.full_name} onChange={set('full_name')}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Email Address" type="email" required
                    value={form.email} onChange={set('email')}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone Number" required
                    value={form.phone} onChange={set('phone')}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Additional Message" multiline rows={2}
                    value={form.message} onChange={set('message')}
                    placeholder="Tell us about your centre (exams covered, number of students, etc.)"
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth type="submit" variant="contained" size="large"
                disabled={loading} sx={{ mt: 4, py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Registration Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
