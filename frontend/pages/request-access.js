import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box, TextField, Button, Typography, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress, InputAdornment
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '@/lib/axios';

export default function RequestAccessPage() {
  const router = useRouter();
  const [examTypes, setExamTypes] = useState([]);
  const [form, setForm] = useState({ full_name: '', role: 'student', email: '', phone: '', exam_interested: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/exam-types/').then(res => setExamTypes(res.data.results || res.data)).catch(() => {});
  }, []);

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-access/', form);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f1f5f9' }}>
      {/* Left branding */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '40%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        p: 6, color: '#fff',
      }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 4, p: 2.5, mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h4" fontWeight={800} mb={2}>Join EduCoach</Typography>
        <Typography sx={{ opacity: 0.85, textAlign: 'center', lineHeight: 1.8 }}>
          Request access to India's leading competitive exam coaching platform.
          Train for EAMCET, DSC, Civils, Group Services, CEEP & ECET.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {['AI-Generated Question Papers', 'Smart Answer Evaluation', 'Detailed Performance Analytics', 'Chapter-wise Analysis'].map(f => (
            <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#a5f3fc' }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>{f}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4, justifyContent: 'center' }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 1, display: 'flex' }}>
              <SchoolIcon sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">EduCoach</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Request Access</Typography>
          <Typography color="text.secondary" mb={4} variant="body2">
            Fill in your details. The admin will review and create your account.
          </Typography>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ bgcolor: 'success.light', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'success.dark' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} mb={1}>Request Submitted!</Typography>
              <Typography color="text.secondary" mb={3}>
                The admin will review your request and contact you with login credentials.
              </Typography>
              <Button variant="contained" onClick={() => router.push('/login')} size="large">
                Go to Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

              <TextField
                fullWidth label="Full Name" margin="normal" value={form.full_name}
                onChange={set('full_name')} required
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>I am a</InputLabel>
                <Select value={form.role} label="I am a" onChange={set('role')}>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth label="Email" type="email" margin="normal" value={form.email}
                onChange={set('email')} required
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />
              <TextField
                fullWidth label="Phone" margin="normal" value={form.phone}
                onChange={set('phone')} required
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Exam Interested In</InputLabel>
                <Select value={form.exam_interested} label="Exam Interested In" onChange={set('exam_interested')}>
                  <MenuItem value="">Not sure yet</MenuItem>
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField
                fullWidth label="Message (optional)" margin="normal" multiline rows={2}
                value={form.message} onChange={set('message')}
                placeholder="Any additional information..."
              />

              <Button
                fullWidth type="submit" variant="contained" size="large"
                sx={{ mt: 2, py: 1.5 }} disabled={loading}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Submit Request'}
              </Button>
            </form>
          )}

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button size="small" onClick={() => router.push('/login')}
                sx={{ fontWeight: 600, p: 0, minWidth: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Sign In
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
