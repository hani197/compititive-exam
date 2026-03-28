import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, CircularProgress, Alert, Avatar, Stack, Card, CardContent,
  Grid, Divider, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function Submissions() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    try {
      const res = await api.get('results/');
      setResults(res.data.results || res.data || []);
    } catch (err) {
      setError('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, []);

  const handleConfirm = async (id) => {
    setConfirming(true);
    try {
      await api.post(`results/${id}/confirm_analysis/`);
      fetchResults();
      setSelectedResult(null);
    } catch (err) {
      alert('Confirmation failed.');
    } finally {
      setConfirming(false);
    }
  };

  const handleRegenerate = async (id) => {
    setRegenerating(true);
    try {
      const res = await api.post(`results/${id}/regenerate_analysis/`);
      const newFeedback = res.data.feedback;
      setSelectedResult(prev => ({ ...prev, ai_overall_feedback: newFeedback }));
      fetchResults();
      alert('Analysis regenerated successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Regeneration failed.';
      alert(`Regeneration failed: ${msg}`);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  const pending = results.filter(r => !r.analysis_confirmed).length;
  const stats = [
    { label: 'Total Submissions', value: results.length, icon: <AssignmentTurnedInIcon />, color: '#7c3aed' },
    { label: 'Pending Review', value: pending, icon: <PendingActionsIcon />, color: '#f59e0b' },
    { label: 'Confirmed', value: results.length - pending, icon: <CheckCircleIcon />, color: '#10b981' },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800}>Student Submissions</Typography>
        <Typography variant="body2" color="text.secondary">Review and confirm detailed performance analysis</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {stats.map(s => (
          <Card key={s.label} sx={{ flex: '1 1 250px', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: s.color + '15', color: s.color, p: 1.5, borderRadius: 2, display: 'flex' }}>{s.icon}</Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{s.label.toUpperCase()}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Exam Paper</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 800 }}>{row.student_name?.[0]}</Avatar>
                      <Typography variant="body2" fontWeight={600}>{row.student_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{row.exam_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.subject_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 100 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={700}>{row.percentage}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={row.percentage} sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9' }} color={row.percentage >= 60 ? 'success' : row.percentage >= 40 ? 'warning' : 'error'} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.analysis_confirmed ? 'Confirmed' : 'Pending Review'}
                      size="small"
                      color={row.analysis_confirmed ? 'success' : 'warning'}
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setSelectedResult(row)}
                      variant="contained"
                      disableElevation
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedResult && (
        <Dialog open={true} onClose={() => setSelectedResult(null)} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#7c3aed', fontWeight: 800 }}>{selectedResult.student_name?.[0]}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>{selectedResult.student_name}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{selectedResult.exam_name} • {selectedResult.subject_name}</Typography>
              </Box>
            </Box>
            <Button 
              variant="outlined"
              size="small" 
              startIcon={regenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />} 
              onClick={() => handleRegenerate(selectedResult.id)}
              disabled={regenerating}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              Regenerate AI Report
            </Button>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, bgcolor: '#fff' }}>
            <Grid container spacing={4}>
              {/* Top Stats Row */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Score', value: `${selectedResult.obtained_marks}/${selectedResult.total_marks}`, sub: `${selectedResult.percentage}%`, color: '#7c3aed' },
                    { label: 'Correct', value: selectedResult.correct_count, sub: 'Questions', color: '#10b981' },
                    { label: 'Wrong', value: selectedResult.wrong_count, sub: 'Questions', color: '#ef4444' },
                    { label: 'Skipped', value: selectedResult.unattempted_count, sub: 'Questions', color: '#64748b' },
                  ].map(s => (
                    <Grid item xs={6} sm={3} key={s.label}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: s.color + '08', border: `1px solid ${s.color}20`, textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary" display="block">{s.label.toUpperCase()}</Typography>
                        <Typography variant="h5" fontWeight={900} color={s.color}>{s.value}</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">{s.sub}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Main Content: Left Column (Analysis) */}
              <Grid item xs={12} md={7}>
                <Stack spacing={4}>
                  {/* Chapter Breakdown */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AnalyticsIcon color="primary" /> Chapter Performance
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Chapter</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Results</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Score</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.values(selectedResult.chapter_analysis || {}).map((ch, i) => (
                            <TableRow key={i}>
                              <TableCell sx={{ py: 1.5 }}>
                                <Typography variant="body2" fontWeight={700}>{ch.chapter_name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {[...Array(ch.correct)].map((_, i) => <Box key={i} sx={{ w: 8, h: 8, bgcolor: '#10b981', borderRadius: '50%' }} />)}
                                  {[...Array(ch.wrong)].map((_, i) => <Box key={i} sx={{ w: 8, h: 8, bgcolor: '#ef4444', borderRadius: '50%' }} />)}
                                </Box>
                                <Box sx={{ width: '100%', mt: 0.5 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(ch.correct / ch.total) * 100} 
                                    sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9' }}
                                    color={ch.correct / ch.total >= 0.7 ? 'success' : ch.correct / ch.total >= 0.4 ? 'warning' : 'error'}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800 }}>
                                {ch.correct}/{ch.total}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* AI Summary */}
                  <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 1, opacity: 0.1 }}><AutoAwesomeIcon sx={{ fontSize: 80 }} /></Box>
                    <Typography variant="subtitle1" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesomeIcon sx={{ color: '#7c3aed' }} fontSize="small" /> AI Performance Mentor
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#4c1d95', lineHeight: 1.7, fontWeight: 500 }}>
                      {selectedResult.ai_overall_feedback || selectedResult.recommendations || 'No detailed analysis available.'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Right Column: Detailed Answers */}
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight={800} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ListAltIcon color="primary" /> Answer Key Detail
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, maxHeight: 600, overflow: 'auto', p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {(selectedResult.answers || []).map((ans, idx) => (
                      <ListItem key={idx} sx={{ borderBottom: '1px solid #f1f5f9', flexDirection: 'column', alignItems: 'flex-start', py: 2, px: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary">QUESTION {idx + 1}</Typography>
                          {ans.is_correct ? <Chip label="Correct" size="small" color="success" icon={<CheckCircleIcon />} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} /> : <Chip label="Incorrect" size="small" color="error" icon={<CancelIcon />} sx={{ height: 20, fontSize: 10, fontWeight: 800 }} />}
                        </Box>
                        <Typography variant="body2" fontWeight={600} mb={1.5} sx={{ color: '#1e293b' }}>{ans.question_detail?.question_text}</Typography>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>STUDENT CHOICE</Typography>
                            <Typography variant="body2" fontWeight={700} color={ans.is_correct ? 'success.main' : 'error.main'}>
                              {ans.selected_option || 'Skipped'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" display="block" color="text.secondary" fontWeight={700}>CORRECT ANSWER</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {ans.question_detail?.correct_answer}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {ans.ai_feedback && (
                          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, width: '100%', borderLeft: '3px solid #7c3aed' }}>
                            <Typography variant="caption" fontWeight={800} color="#7c3aed" display="block">AI FEEDBACK</Typography>
                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#475569' }}>{ans.ai_feedback}</Typography>
                          </Box>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setSelectedResult(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>Close Report</Button>
            {!selectedResult.analysis_confirmed && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleConfirm(selectedResult.id)}
                disabled={confirming}
                startIcon={confirming ? <CircularProgress size={18} /> : <CheckCircleIcon />}
                sx={{ borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none' }}
              >
                Confirm & Release to Student
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default withAdmin(Submissions);
