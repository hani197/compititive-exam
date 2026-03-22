import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  Chip, CircularProgress, Avatar, LinearProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
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
  const isAdmin = user?.role === 'admin' || user?.is_staff;

  useEffect(() => {
    const endpoints = isAdmin 
      ? [api.get('/results/dashboard/'), api.get('/papers/old-papers/')] 
      : [api.get('/papers/assignments/'), api.get('/results/dashboard/'), api.get('/sessions/'), api.get('/papers/old-papers/')];

    Promise.all(endpoints).then(res => {
      if (isAdmin) {
        setData(prev => ({ ...prev, stats: res[0].data, oldPapers: res[1].data.results || res[1].data }));
      } else {
        setData({
          assignments: res[0].data.results || res[0].data,
          stats: res[1].data,
          sessions: res[2].data.results || res[2].data,
          oldPapers: res[3].data.results || res[3].data,
        });
      }
    }).finally(() => setLoading(false));
  }, [isAdmin]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#7c3aed' }} />
    </Box>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const statsList = isAdmin ? ADMIN_STATS : STUDENT_STATS;

  return (
    <Box sx={{ p: 3, maxWidth: 1240, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 50%, #7c3aed 100%)',
        borderRadius: 4, p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(168,85,247,0.3)', filter: 'blur(30px)' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(249,115,22,0.2)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" color="#fff" fontWeight={800}>
            {greeting}, {user?.first_name || user?.username}! 👋
          </Typography>
          <Typography color="rgba(255,255,255,0.7)" mt={0.5} fontWeight={500}>
            {isAdmin 
              ? `Manage your coaching centre: ${user?.coaching_centre_name || 'Admin Panel'}` 
              : `You have ${data.assignments.filter(a => !data.sessions.find(s => s.paper === a.paper_detail?.id && s.status !== 'in_progress')).length} pending exams.`}
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2.5} mb={5}>
        {statsList.map(card => (
          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 4} key={card.label}>
            <Card sx={{ background: card.gradient, boxShadow: `0 8px 32px ${card.shadow}`, border: 'none', borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2.5, p: 1.2, display: 'flex', backdropFilter: 'blur(10px)' }}>
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
          </Grid>
        ))}
      </Grid>

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
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
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
                {stats?.recent_results?.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{r.student_name}</Typography>
                    </TableCell>
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
                      <Chip 
                        label={r.analysis_confirmed ? 'Confirmed' : 'Pending'} 
                        size="small" 
                        color={r.analysis_confirmed ? 'success' : 'warning'}
                        sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.recent_results || stats.recent_results.length === 0) && (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No recent submissions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} mb={2}>Quick Actions</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/admin/generate-paper')}>Generate Paper</Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} onClick={() => navigate('/admin/register')}>Add Students</Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" startIcon={<AssignmentIcon />} onClick={() => navigate('/admin/assignments')}>Assign Mentors</Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate('/admin/old-papers')}>Old Papers</Button>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" startIcon={<FactCheckIcon />} onClick={() => navigate('/admin/submissions')}>Review Results</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Old Papers List for Admin */}
        <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>Old Papers</Typography>
            <Button size="small" onClick={() => navigate('/admin/old-papers')}>Manage</Button>
          </Box>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small">
              <TableBody>
                {stats?.old_papers?.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 180 }} noWrap>{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.exam_type_name} · {p.year}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" component="a" href={p.file} target="_blank"><PictureAsPdfIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.old_papers || stats.old_papers.length === 0) && (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4 }}><Typography variant="caption" color="text.secondary">No papers uploaded</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

function StudentDashboardView({ data, navigate }) {
  const getSession = id => data.sessions.find(s => s.paper === id || s.paper_detail?.id === id);
  const pending = data.assignments.filter(a => { const s = getSession(a.paper_detail?.id); return !s || s.status === 'in_progress'; });
  const done = data.assignments.filter(a => { const s = getSession(a.paper_detail?.id); return s && s.status !== 'in_progress'; });

  const handleStart = async (paperId) => {
    const ex = getSession(paperId);
    if (ex) { navigate('/exam/' + ex.id); return; }
    try {
      const res = await api.post('/sessions/', { paper_id: paperId });
      navigate('/exam/' + res.data.id);
    } catch (err) { alert(err.response?.data?.error || 'Could not start exam.'); }
  };

  return (
    <>
      {pending.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <AssignmentIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Pending Exams</Typography>
            <Chip label={pending.length} size="small" sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 700 }} />
          </Box>
          <Grid container spacing={2.5} mb={4}>
            {pending.map(assignment => {
              const paper = assignment.paper_detail;
              if (!paper) return null;
              const session = getSession(paper.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} mb={1}>{paper.title}</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>{paper.exam_type_name} · {paper.subject_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`${paper.total_questions} Qs`} size="small" />
                        <Chip label={`${paper.duration_minutes} min`} size="small" icon={<TimerIcon />} />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="contained" startIcon={<PlayArrowIcon />} onClick={() => handleStart(paper.id)}>
                        {session ? 'Continue' : 'Start'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {done.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <CheckCircleIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Completed Exams</Typography>
          </Box>
          <Grid container spacing={2.5} mb={4}>
            {done.map(assignment => {
              const paper = assignment.paper_detail;
              const session = getSession(paper.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700}>{paper.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{paper.subject_name}</Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="outlined" color="success" onClick={() => navigate('/result/' + session.id)}>View Result</Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {data.oldPapers?.length > 0 && (
        <Box sx={{ mt: 5, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <HistoryIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Previous Year Papers</Typography>
          </Box>
          <Grid container spacing={2}>
            {data.oldPapers.map(paper => (
              <Grid item xs={12} sm={6} md={4} key={paper.id}>
                <Paper sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #e2e8f0', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: '#7c3aed' } }}>
                  <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626' }}><PictureAsPdfIcon /></Avatar>
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{paper.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={paper.year} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                      <Typography variant="caption" color="text.secondary" noWrap>{paper.exam_type_name}</Typography>
                    </Box>
                  </Box>
                  <Button size="small" variant="outlined" component="a" href={paper.file} target="_blank">View</Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {data.stats?.recent_results?.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Performance History</Typography>
          <Grid container spacing={2}>
            {data.stats.recent_results.map(r => (
              <Grid item xs={12} sm={6} key={r.id}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight={700}>{r.exam_name}</Typography>
                    <Typography variant="h6" color={r.percentage >= 60 ? 'success.main' : 'error.main'}>{r.percentage}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={r.percentage} color={r.percentage >= 60 ? 'success' : 'error'} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  );
}

export default withAuth(Dashboard);
