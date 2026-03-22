import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, CircularProgress, Alert, Avatar, Grid, Card, CardContent
} from '@mui/material';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function SubmissionsPage() {
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchResults = () => api.get('/results/').then(r => setResults(r.data.results || r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchResults(); }, []);

  const handleConfirm = async (id) => {
    setConfirming(true);
    await api.post('/results/' + id + '/confirm/');
    setSelected(null);
    fetchResults();
    setConfirming(false);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#7c3aed' }} />
    </Box>
  );

  const pending = results.filter(r => !r.analysis_confirmed).length;
  const confirmed = results.filter(r => r.analysis_confirmed).length;
  const chapterData = selected ? Object.values(selected.chapter_analysis || {}) : [];
  const pctColor = p => p >= 70 ? '#059669' : p >= 40 ? '#d97706' : '#dc2626';
  const pctMuiColor = p => p >= 70 ? 'success' : p >= 40 ? 'warning' : 'error';

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%)',
        borderRadius: 3, p: 3, mb: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(168,85,247,0.3)', filter: 'blur(30px)' }} />
        <Typography variant="h5" color="#fff" fontWeight={800}>Student Submissions</Typography>
        <Typography color="rgba(255,255,255,0.65)" mt={0.3} fontSize="0.9rem">
          Review AI analysis and release results to students
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: 'Pending Review', value: pending, grad: 'linear-gradient(135deg, #d97706, #f59e0b)', shadow: 'rgba(217,119,6,0.35)', icon: <HourglassEmptyIcon sx={{ color: '#fff', fontSize: 24 }} /> },
          { label: 'Confirmed', value: confirmed, grad: 'linear-gradient(135deg, #059669, #10b981)', shadow: 'rgba(5,150,105,0.35)', icon: <CheckCircleIcon sx={{ color: '#fff', fontSize: 24 }} /> },
          { label: 'Total', value: results.length, grad: 'linear-gradient(135deg, #7c3aed, #a855f7)', shadow: 'rgba(124,58,237,0.35)', icon: <FactCheckIcon sx={{ color: '#fff', fontSize: 24 }} /> },
        ].map(c => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card sx={{ background: c.grad, boxShadow: `0 8px 32px ${c.shadow}`, border: 'none' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3, p: 1.5, display: 'flex', backdropFilter: 'blur(10px)' }}>
                  {c.icon}
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={900} color="#fff" lineHeight={1}>{c.value}</Typography>
                  <Typography color="rgba(255,255,255,0.75)" fontWeight={500} fontSize="0.85rem">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Exam / Subject</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map(r => {
                const pct = r.percentage ?? 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', fontSize: 13, fontWeight: 800 }}>
                          {r.student_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700}>{r.student_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{r.exam_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.subject_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={pct.toFixed(1) + '%'} size="small" color={pctMuiColor(pct)}
                        sx={{ fontWeight: 800, minWidth: 62 }} />
                    </TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{r.obtained_marks}/{r.total_marks}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{new Date(r.evaluated_at).toLocaleDateString()}</Typography></TableCell>
                    <TableCell>
                      {r.analysis_confirmed
                        ? <Chip label="Confirmed" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700 }} />
                        : <Chip label="Pending" size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 700 }} />
                      }
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="outlined" onClick={() => setSelected(r)}>View</Button>
                        {!r.analysis_confirmed && (
                          <Button size="small" variant="contained" color="success" onClick={() => handleConfirm(r.id)}>
                            Confirm
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <FactCheckIcon sx={{ fontSize: 52, color: '#c4b5fd', display: 'block', mx: 'auto', mb: 1.5 }} />
                    <Typography color="text.secondary" fontWeight={600}>No submissions yet</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <Box sx={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', p: 3, borderRadius: '20px 20px 0 0' }}>
              <Typography variant="h6" color="#fff" fontWeight={800}>{selected.student_name}</Typography>
              <Typography color="rgba(255,255,255,0.7)">{selected.exam_name} · {selected.subject_name}</Typography>
            </Box>
            <DialogContent sx={{ pt: 3 }}>
              {/* Score overview */}
              <Grid container spacing={2} mb={3}>
                {[
                  { label: 'Score', value: (selected.percentage ?? 0).toFixed(1) + '%', color: pctColor(selected.percentage ?? 0) },
                  { label: 'Marks', value: `${selected.obtained_marks}/${selected.total_marks}`, color: '#3b0764' },
                  { label: 'Correct', value: selected.correct_count, color: '#059669' },
                  { label: 'Wrong', value: selected.wrong_count, color: '#dc2626' },
                  { label: 'Skipped', value: selected.unattempted_count, color: '#6b21a8' },
                ].map(item => (
                  <Grid item xs key={item.label}>
                    <Box sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)', borderRadius: 3, p: 2, border: '1px solid rgba(167,139,250,0.2)' }}>
                      <Typography variant="h5" fontWeight={800} color={item.color}>{item.value}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {chapterData.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Chapter Analysis</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {chapterData.map((ch, i) => {
                      const p = ch.total > 0 ? (ch.correct / ch.total) * 100 : 0;
                      return (
                        <Box key={i}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{ch.chapter_name}</Typography>
                            <Typography variant="body2" fontWeight={700} color={pctColor(p)}>
                              {ch.correct}/{ch.total} ({p.toFixed(0)}%)
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={p}
                            color={pctMuiColor(p)} sx={{ height: 10, borderRadius: 5 }} />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {selected.ai_overall_feedback && (
                <Box sx={{ background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)', borderRadius: 3, p: 3, border: '1px solid rgba(167,139,250,0.25)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <SmartToyIcon sx={{ color: '#7c3aed', fontSize: 22 }} />
                    <Typography variant="subtitle2" fontWeight={800} color="#5b21b6">AI Feedback</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
                    {selected.ai_overall_feedback}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
              <Button onClick={() => setSelected(null)} variant="outlined">Close</Button>
              {!selected.analysis_confirmed && (
                <Button variant="contained" color="success"
                  onClick={() => handleConfirm(selected.id)} disabled={confirming}
                  startIcon={confirming ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckCircleIcon />}>
                  Confirm & Release
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default withAdmin(SubmissionsPage);
