import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  Chip, CircularProgress, Avatar, LinearProgress
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { withAuth } from '@/components/withAuth';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

const STAT_CARDS = [
  {
    key: 'total_exams_taken',
    label: 'Exams Taken',
    icon: <QuizIcon sx={{ fontSize: 26, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    shadow: 'rgba(124,58,237,0.4)',
    fmt: v => v ?? 0,
  },
  {
    key: 'average_percentage',
    label: 'Avg Score',
    icon: <TrendingUpIcon sx={{ fontSize: 26, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    shadow: 'rgba(8,145,178,0.4)',
    fmt: v => (v ?? 0) + '%',
  },
  {
    key: 'best_score',
    label: 'Best Score',
    icon: <EmojiEventsIcon sx={{ fontSize: 26, color: '#fff' }} />,
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow: 'rgba(217,119,6,0.4)',
    fmt: v => (v ?? 0) + '%',
  },
];

function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/papers/assignments/'),
      api.get('/results/dashboard/'),
      api.get('/sessions/'),
    ]).then(([a, d, s]) => {
      setAssignments(a.data.results || a.data);
      setStats(d.data);
      setSessions(s.data.results || s.data);
    }).finally(() => setLoading(false));
  }, []);

  const getSession = id => sessions.find(s => s.paper === id || s.paper_detail?.id === id);

  const handleStart = async (paperId) => {
    const ex = getSession(paperId);
    if (ex) { router.push('/exam/' + ex.id); return; }
    try {
      const res = await api.post('/sessions/', { paper_id: paperId });
      router.push('/exam/' + res.data.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not start exam.');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#7c3aed' }} />
    </Box>
  );

  const pending = assignments.filter(a => { const s = getSession(a.paper_detail?.id); return !s || s.status === 'in_progress'; });
  const done = assignments.filter(a => { const s = getSession(a.paper_detail?.id); return s && s.status !== 'in_progress'; });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Hero header */}
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
            {pending.length > 0
              ? `You have ${pending.length} pending exam${pending.length > 1 ? 's' : ''} waiting.`
              : 'All caught up! Great work.'}
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2.5} mb={4}>
          {STAT_CARDS.map(card => (
            <Grid item xs={12} sm={4} key={card.label}>
              <Card sx={{ background: card.gradient, boxShadow: `0 8px 32px ${card.shadow}`, border: 'none' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3, p: 1.5, display: 'flex', backdropFilter: 'blur(10px)' }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={900} color="#fff" lineHeight={1}>
                      {card.fmt(stats[card.key])}
                    </Typography>
                    <Typography color="rgba(255,255,255,0.75)" fontWeight={500} fontSize="0.85rem">
                      {card.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pending */}
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
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    border: '2px solid transparent',
                    background: 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#a78bfa,#f97316) border-box',
                    '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.25s ease', boxShadow: '0 12px 40px rgba(124,58,237,0.2)' },
                    transition: 'all 0.25s ease',
                  }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)', p: 2, borderRadius: '14px 14px 0 0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Avatar sx={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', width: 40, height: 40 }}>
                          <AssignmentIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Chip label="Pending" size="small" sx={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', color: '#fff', fontWeight: 700, border: 'none' }} />
                      </Box>
                    </Box>
                    <CardContent sx={{ flex: 1, pt: 2 }}>
                      <Typography variant="h6" fontWeight={700} mb={0.5} lineHeight={1.3}>{paper.title}</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {paper.exam_type_name} · {paper.subject_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`${paper.total_questions} Qs`} size="small" sx={{ bgcolor: '#f5f0ff', color: '#5b21b6', fontWeight: 600 }} />
                        <Chip icon={<TimerIcon fontSize="small" />} label={`${paper.duration_minutes} min`} size="small" sx={{ bgcolor: '#f0fdf4', color: '#059669', fontWeight: 600 }} />
                        <Chip label={paper.difficulty} size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600, textTransform: 'capitalize' }} />
                      </Box>
                      {assignment.due_date && (
                        <Typography variant="caption" fontWeight={700} display="block" mt={1.5}
                          sx={{ color: '#dc2626', background: '#fee2e2', px: 1, py: 0.3, borderRadius: 1.5, display: 'inline-block' }}>
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="contained" startIcon={<PlayArrowIcon />}
                        onClick={() => handleStart(paper.id)} sx={{ py: 1.2 }}>
                        {session ? 'Continue Exam' : 'Start Exam'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <CheckCircleIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Completed Exams</Typography>
            <Chip label={done.length} size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700 }} />
          </Box>
          <Grid container spacing={2.5} mb={4}>
            {done.map(assignment => {
              const paper = assignment.paper_detail;
              if (!paper) return null;
              const session = getSession(paper.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={assignment.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.9 }}>
                    <Box sx={{ background: 'linear-gradient(135deg, #d1fae5, #ecfdf5)', p: 2, borderRadius: '14px 14px 0 0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Avatar sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', width: 40, height: 40 }}>
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Chip label="Done" size="small" sx={{ bgcolor: '#059669', color: '#fff', fontWeight: 700 }} />
                      </Box>
                    </Box>
                    <CardContent sx={{ flex: 1, pt: 2 }}>
                      <Typography variant="h6" fontWeight={700} mb={0.5}>{paper.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{paper.exam_type_name} · {paper.subject_name}</Typography>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button fullWidth variant="outlined" color="success"
                        onClick={() => router.push('/result/' + session.id)} sx={{ py: 1.2 }}>
                        View Result
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {assignments.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 8, background: 'linear-gradient(135deg, #faf8ff, #f5f0ff)' }}>
          <AutoAwesomeIcon sx={{ fontSize: 56, color: '#c4b5fd', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="text.secondary">No papers assigned yet</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Your admin will assign exam papers. Check back soon!
          </Typography>
        </Card>
      )}

      {/* Recent Results */}
      {stats?.recent_results?.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', borderRadius: 2, p: 0.8, display: 'flex' }}>
              <EmojiEventsIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Recent Results</Typography>
          </Box>
          <Grid container spacing={2}>
            {stats.recent_results.map(r => {
              const pct = r.percentage ?? 0;
              const color = pct >= 60 ? '#059669' : '#dc2626';
              return (
                <Grid item xs={12} sm={6} key={r.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Typography fontWeight={700}>{r.exam_name}</Typography>
                          <Typography variant="body2" color="text.secondary">{r.subject_name}</Typography>
                        </Box>
                        <Typography variant="h5" fontWeight={800} color={color}>{pct.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct}
                        color={pct >= 60 ? 'success' : 'error'} sx={{ height: 8, borderRadius: 4 }} />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Box>
  );
}

export default withAuth(StudentDashboard);
