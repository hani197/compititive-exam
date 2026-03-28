import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions, Button,
  Chip, CircularProgress, Avatar, LinearProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert, IconButton, Stack,
  Divider
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { withAuth } from '../components/withAuth';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const STUDENT_STATS = [
  { key: 'total_exams_taken', label: 'Exams Taken', icon: <QuizIcon />, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', shadow: 'rgba(124,58,237,0.4)', fmt: v => v ?? 0 },
  { key: 'average_percentage', label: 'Avg Score', icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', shadow: 'rgba(8,145,178,0.4)', fmt: v => (v ?? 0) + '%' },
  { key: 'best_score', label: 'Best Score', icon: <EmojiEventsIcon />, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', shadow: 'rgba(217,119,6,0.4)', fmt: v => (v ?? 0) + '%' },
];

const ADMIN_STATS = [
  { key: 'total_students', label: 'Total Students', icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)', shadow: 'rgba(124,58,237,0.4)', fmt: v => v ?? 0 },
  { key: 'total_instructors', label: 'Instructors', icon: <SchoolIcon />, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', shadow: 'rgba(8,145,178,0.4)', fmt: v => v ?? 0 },
  { key: 'total_papers', label: 'Papers Generated', icon: <AutoAwesomeIcon />, gradient: 'linear-gradient(135deg, #059669, #10b981)', shadow: 'rgba(5,150,105,0.4)', fmt: v => v ?? 0 },
  { key: 'pending_confirmation', label: 'Pending Review', icon: <FactCheckIcon />, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)', shadow: 'rgba(217,119,6,0.4)', fmt: v => v ?? 0 },
];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ assignments: [], stats: null, sessions: [], oldPapers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = user?.role === 'admin' || user?.is_staff;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = isAdmin 
          ? [api.get('results/dashboard/'), api.get('papers/old-papers/')] 
          : [api.get('papers/assignments/'), api.get('results/dashboard/'), api.get('sessions/'), api.get('papers/old-papers/')];

        const res = await Promise.all(endpoints);
        
        if (isAdmin) {
          setData({ 
            assignments: [],
            stats: res[0].data || null, 
            sessions: [],
            oldPapers: res[1].data?.results || res[1].data || [] 
          });
        } else {
          setData({
            assignments: res[0].data?.results || res[0].data || [],
            stats: res[1].data || null,
            sessions: res[2].data?.results || res[2].data || [],
            oldPapers: res[3].data?.results || res[3].data || [],
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [isAdmin, user]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#7c3aed' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 10 }}>
      <Alert severity="error">{error}</Alert>
      <Button fullWidth sx={{ mt: 2 }} onClick={() => window.location.reload()}>Retry</Button>
    </Box>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const statsList = isAdmin ? ADMIN_STATS : STUDENT_STATS;

  const pendingCount = isAdmin ? 0 : (data.assignments || []).filter(a => 
    !(data.sessions || []).find(s => (s.paper === a.paper_detail?.id || s.paper_detail?.id === a.paper_detail?.id) && s.status !== 'in_progress')
  ).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1240, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 50%, #7c3aed 100%)',
        borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
      }}>
        <Typography variant="h4" color="#fff" fontWeight={800}>
          {greeting}, {user?.first_name || user?.username}! 👋
        </Typography>
        <Typography color="rgba(255,255,255,0.7)" mt={0.5} fontWeight={500}>
          {isAdmin 
            ? `Manage your coaching centre: ${user?.coaching_centre_name || 'Admin Panel'}` 
            : `You have ${pendingCount} pending exams.`}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 5 }}>
        {statsList.map(card => (
          <Box key={card.label} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
            <Card sx={{ background: card.gradient, border: 'none', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2.5, p: 1.2, display: 'flex' }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={900} color="#fff" lineHeight={1}>
                    {card.fmt(data.stats?.[card.key])}
                  </Typography>
                  <Typography color="rgba(255,255,255,0.75)" fontWeight={600} fontSize="0.75rem" sx={{ textTransform: 'uppercase', mt: 0.5 }}>
                    {card.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {isAdmin ? (
        <AdminDashboardView stats={data.stats} navigate={navigate} />
      ) : (
        <StudentDashboardView data={data} navigate={navigate} />
      )}
    </Box>
  );
}

function AdminDashboardView({ stats, navigate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: { xs: '1 1 auto', md: '2 1 0' } }}>
        <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>Recent Submissions</Typography>
            <Button size="small" onClick={() => navigate('/admin/submissions')}>View All</Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Exam</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats?.recent_results || []).map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{r.student_name}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">{r.exam_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.subject_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800} color={r.percentage >= 60 ? 'success.main' : 'error.main'}>
                        {r.percentage}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.analysis_confirmed ? 'Confirmed' : 'Pending'} size="small" color={r.analysis_confirmed ? 'success' : 'warning'} sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 0' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} mb={2}>Quick Actions</Typography>
            <Stack spacing={1.5}>
              <Button fullWidth variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/admin/generate-paper')}>Generate Paper</Button>
              <Button fullWidth variant="outlined" startIcon={<SchoolIcon />} onClick={() => navigate('/admin/syllabus')}>Manage Syllabus</Button>
              <Button fullWidth variant="outlined" startIcon={<QuizIcon />} onClick={() => navigate('/admin/generated-papers')}>Generated Library</Button>
              <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} onClick={() => navigate('/admin/register')}>Add Students</Button>
              <Button fullWidth variant="outlined" startIcon={<AssignmentIcon />} onClick={() => navigate('/admin/assignments')}>Assign Mentors</Button>
              <Button fullWidth variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate('/admin/old-papers')}>Old Papers</Button>
              <Button fullWidth variant="outlined" startIcon={<FactCheckIcon />} onClick={() => navigate('/admin/submissions')}>Review Results</Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function StudentDashboardView({ data, navigate }) {
  const [loadingPaper, setLoadingPaper] = useState(null);
  const getSession = id => {
    // Check sessions list first
    const session = (data.sessions || []).find(s => s.paper === id || s.paper_detail?.id === id);
    if (session) {
      // Find matching result to get confirmation status
      const result = (data.stats?.recent_results || []).find(r => r.session === session.id);
      return { ...session, analysis_confirmed: result?.analysis_confirmed };
    }
    return null;
  };
  const pending = (data.assignments || []).filter(a => { const s = getSession(a.paper_detail?.id); return !s || s.status === 'in_progress'; });
  const done = (data.assignments || []).filter(a => { const s = getSession(a.paper_detail?.id); return s && s.status !== 'in_progress'; });

  const handleStartExam = async (assignment) => {
    const paperId = assignment.paper_detail?.id;
    const existingSession = getSession(paperId);
    
    if (existingSession) {
      navigate('/exam/' + existingSession.id);
      return;
    }

    setLoadingPaper(assignment.id);
    try {
      const res = await api.post('sessions/', { paper_id: paperId });
      navigate('/exam/' + res.data.id);
    } catch (err) {
      console.error("Failed to start exam:", err);
      alert("Failed to start exam session.");
    } finally {
      setLoadingPaper(null);
    }
  };

  return (
    <Stack spacing={4}>
      {pending.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={700} mb={2.5}>Pending Exams</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
            {pending.map(assignment => (
              <Box key={assignment.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip label={assignment.paper_detail?.exam_type_name} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimerIcon sx={{ fontSize: 14 }} /> {assignment.paper_detail?.duration_minutes}m
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                      {assignment.paper_detail?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <SchoolIcon sx={{ fontSize: 16 }} /> {assignment.paper_detail?.subject_name}
                    </Typography>
                  </CardContent>
                  <Divider sx={{ opacity: 0.5 }} />
                  <CardActions sx={{ p: 2, bgcolor: '#fcfcfd' }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={loadingPaper === assignment.id ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />} 
                      onClick={() => handleStartExam(assignment)}
                      disabled={loadingPaper === assignment.id}
                      sx={{ borderRadius: 2, py: 1, fontWeight: 700, textTransform: 'none' }}
                    >
                      {getSession(assignment.paper_detail?.id) ? 'Continue Exam' : 'Start Exam'}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {done.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={700} mb={2.5}>Completed Exams</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Paper Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {done.map(assignment => {
                  const s = getSession(assignment.paper_detail?.id);
                  return (
                    <TableRow key={assignment.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{assignment.paper_detail?.title}</TableCell>
                      <TableCell>{assignment.paper_detail?.subject_name}</TableCell>
                      <TableCell color="text.secondary">{s?.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'Pending'}</TableCell>
                      <TableCell align="right">
                        {s?.analysis_confirmed ? (
                          <Button size="small" variant="outlined" onClick={() => navigate('/result/' + s?.id)} sx={{ borderRadius: 2 }}>View Result</Button>
                        ) : (
                          <Chip label="Pending Review" size="small" variant="outlined" color="warning" sx={{ fontWeight: 700 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
}

export default withAuth(Dashboard);
