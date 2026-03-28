import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Card, CardContent, CardActions, 
  Button, Container, AppBar, Toolbar, Chip, Avatar, CircularProgress
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from '../lib/api';

export default function HomePage() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('coaching/centres/')
      .then(res => setCentres(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Hero Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e0546 0%, #4c1d95 100%)', 
        color: '#fff', pt: 8, pb: 10, textAlign: 'center' 
      }}>
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'inline-flex', p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', 
            borderRadius: 4, mb: 3, backdropFilter: 'blur(10px)' 
          }}>
            <SchoolIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h2" fontWeight={900} gutterBottom letterSpacing={-1}>
            EduCoach
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.8, mb: 4, fontWeight: 400 }}>
            India's most advanced AI-powered competitive exam platform.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" size="large" 
              onClick={() => navigate('/login')}
              sx={{ bgcolor: '#fff', color: '#4c1d95', fontWeight: 700, '&:hover': { bgcolor: '#f3f4f6' } }}
            >
              Sign In
            </Button>
            <Button 
              variant="outlined" size="large" 
              onClick={() => navigate('/register-centre')}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 700 }}
            >
              Register Centre
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Box sx={{ 
          bgcolor: '#fff', p: 4, borderRadius: 4, 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' 
        }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#1e293b">Partner Coaching Centres</Typography>
              <Typography variant="body2" color="text.secondary">Select a centre below to join as a student or instructor.</Typography>
            </Box>
            <Chip label={`${centres.length} Active Centres`} color="primary" sx={{ fontWeight: 700 }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {centres.map((centre) => (
                <Grid item xs={12} sm={6} md={4} key={centre.id}>
                  <Card sx={{ 
                    height: '100%', display: 'flex', flexDirection: 'column', 
                    borderRadius: 3, border: '1px solid #e2e8f0', transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 20px rgba(0,0,0,0.1)' }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#ede9fe', color: '#7c3aed', borderRadius: 2 }}>
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {centre.name}
                          </Typography>
                          <Typography variant="caption" color="primary" fontWeight={700}>
                            CODE: {centre.code}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{centre.city}</Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        mt: 2, display: '-webkit-box', WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                      }}>
                        {centre.address || 'Join this centre to get access to AI-powered exam preparation materials and practice tests.'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        fullWidth variant="contained" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/request-access?centre=${centre.id}`)}
                        sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
                      >
                        Join Centre
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              
              {centres.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#f8fafc', borderRadius: 4, border: '2px dashed #e2e8f0' }}>
                    <Typography color="text.secondary">No coaching centres found.</Typography>
                    <Button sx={{ mt: 2 }} onClick={() => navigate('/register-centre')}>Register your centre here</Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        <Typography variant="body2">© 2026 EduCoach Platform. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}
