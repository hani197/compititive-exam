import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, CircularProgress, Alert, Avatar, Stack, Card, CardContent
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
        <Typography variant="body2" color="text.secondary">Review and confirm AI-generated performance analysis</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {stats.map(s => (
          <Card key={s.label} sx={{ flex: '1 1 250px', borderRadius: 3 }}>
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

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
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
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#ede9fe', color: '#7c3aed', fontSize: 12 }}>{row.student_name?.[0]}</Avatar>
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
                      <LinearProgress variant="determinate" value={row.percentage} sx={{ height: 6, borderRadius: 3 }} color={row.percentage >= 60 ? 'success' : 'error'} />
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
                      variant="outlined"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No submissions yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedResult && (
        <Dialog open={true} onClose={() => setSelectedResult(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>Performance Analysis: {selectedResult.student_name}</Typography>
            <Button 
              size="small" 
              startIcon={regenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />} 
              onClick={() => handleRegenerate(selectedResult.id)}
              disabled={regenerating}
              sx={{ fontWeight: 700 }}
            >
              Regenerate AI
            </Button>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>AI Summary</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedResult.ai_overall_feedback || selectedResult.ai_analysis || selectedResult.recommendations || 'No analysis available.'}
                </Typography>
              </Box>
              
              {!selectedResult.analysis_confirmed && (
                <Alert severity="info">Review the AI analysis above. Once confirmed, the student can view their detailed results.</Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #f1f5f9' }}>
            <Button onClick={() => setSelectedResult(null)}>Close</Button>
            {!selectedResult.analysis_confirmed && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleConfirm(selectedResult.id)}
                disabled={confirming}
                startIcon={confirming ? <CircularProgress size={18} /> : <CheckCircleIcon />}
              >
                Confirm & Release Result
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default withAdmin(Submissions);
