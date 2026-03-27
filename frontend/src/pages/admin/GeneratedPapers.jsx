import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress,
  Avatar, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Divider, List, ListItem, ListItemText, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function GeneratedPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchPapers = async () => {
    try {
      const res = await api.get('/papers/');
      setPapers(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load generated papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPapers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this generated paper and all its questions?')) return;
    try {
      await api.delete(`/papers/${id}/`);
      fetchPapers();
    } catch (err) {
      alert('Failed to delete paper.');
    }
  };

  const handleViewDetails = (paper) => {
    setSelectedPaper(paper);
    setViewDialogOpen(true);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">Loading Library...</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon /> Generated Papers Library
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>View and manage all AI-generated question papers</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Paper Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Exam & Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Stats</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {papers.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>{row.title || 'Untitled Paper'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Chip label={row.exam_type_name || 'N/A'} size="small" variant="outlined" />
                    <Chip label={row.subject_name || 'N/A'} size="small" variant="outlined" color="primary" />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <QuizIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">{row.total_questions || 0} Qs</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">{row.duration_minutes || 0}m</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={(row.status || 'unknown').toUpperCase()} 
                    size="small" 
                    color={row.status === 'ready' ? 'success' : row.status === 'failed' ? 'error' : 'warning'}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Questions">
                      <IconButton onClick={() => handleViewDetails(row)} color="primary" size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(row.id)} color="error" size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {papers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">No papers generated yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800}>{selectedPaper?.title}</Typography>
            <Chip label={`${selectedPaper?.questions?.length || 0} Questions`} color="primary" />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {(selectedPaper?.questions || []).map((q, idx) => (
              <Box key={q.id}>
                <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 3 }}>
                  <Typography variant="subtitle2" color="primary" fontWeight={800} gutterBottom>
                    QUESTION {q.question_number}
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                    {q.question_text}
                  </Typography>
                  
                  {q.question_type === 'mcq' && (
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                        {['a', 'b', 'c', 'd'].map(opt => {
                          const isCorrect = (q.correct_answer || '').toLowerCase() === opt || (q.correct_answer || '').toLowerCase() === `option_${opt}`;
                          return (
                            <Paper 
                              key={opt} 
                              variant="outlined" 
                              sx={{ 
                                p: 1.5, 
                                bgcolor: isCorrect ? '#f0fdf4' : '#fff',
                                borderColor: isCorrect ? '#22c55e' : '#e2e8f0',
                                position: 'relative'
                              }}
                            >
                              <Typography variant="body2">
                                <strong>{opt.toUpperCase()}.</strong> {q[`option_${opt}`]}
                              </Typography>
                              {isCorrect && (
                                <Chip 
                                  label="Correct" 
                                  size="small" 
                                  color="success" 
                                  sx={{ position: 'absolute', top: -10, right: 10, height: 20, fontSize: '0.65rem' }} 
                                />
                              )}
                            </Paper>
                          );
                        })}
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1, borderLeft: '4px solid #22c55e' }}>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          CORRECT ANSWER: {(q.correct_answer || '').replace('option_', '').toUpperCase()} — {q[`option_${(q.correct_answer || '').replace('option_', '').toLowerCase()}`]}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {q.explanation && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fefce8', borderRadius: 2, width: '100%' }}>
                      <Typography variant="caption" fontWeight={800} display="block" color="warning.dark">EXPLANATION:</Typography>
                      <Typography variant="body2" color="text.secondary">{q.explanation}</Typography>
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained">Close Library</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdmin(GeneratedPapers);
