import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Button, Chip, LinearProgress, Divider, Paper, Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { withAuth } from '../components/withAuth';
import api from '../lib/api';

const COLORS = ['#4caf50', '#f44336', '#9e9e9e'];

function ResultView() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID.');
      setLoading(false);
      return;
    }
    
    const fetchResult = async () => {
      try {
        const res = await api.get('results/?session=' + sessionId);
        const list = res.data.results || res.data;
        if (list.length > 0) {
          setResult(list[0]);
        } else {
          // Check if session exists but result is not confirmed
          const sessRes = await api.get('sessions/' + sessionId + '/');
          if (sessRes.data.status === 'evaluated') {
            setError('PENDING_APPROVAL');
          } else {
            setError('Your result is still being processed or was not found.');
          }
        }
      } catch (err) {
        setError('Failed to fetch result. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [sessionId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  
  if (error === 'PENDING_APPROVAL') return (
    <Box sx={{ p: 4, textAlign: 'center', mt: 10, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc' }}>
        <Typography variant="h4" fontWeight={800} gutterBottom color="primary">Exam Submitted!</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Your performance is being analyzed. 
          Results will be available once the administrator approves them.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Typically, this takes a few minutes for the AI and admin to finalize the feedback.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} size="large" sx={{ fontWeight: 700 }}>
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );

  if (error || !result) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 10 }}>
      <Typography variant="h6" color="error" gutterBottom>{error || 'Result not found.'}</Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
    </Box>
  );

  const pieData = [
    { name: 'Correct', value: result.correct_count },
    { name: 'Wrong', value: result.wrong_count },
    { name: 'Unattempted', value: result.unattempted_count },
  ];
  const chapterData = Object.values(result.chapter_analysis || {});
  const passed = result.percentage >= 60;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" mb={0.5}>Exam Result</Typography>
      <Typography color="text.secondary" mb={3}>{result.exam_name} — {result.subject_name}</Typography>

      <Card sx={{ mb: 3, bgcolor: passed ? 'success.light' : 'error.light' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h2" fontWeight="bold">{result.percentage.toFixed(1)}%</Typography>
          <Typography variant="h6">{result.obtained_marks} / {result.total_marks} marks</Typography>
          <Chip label={passed ? 'Passed' : 'Needs Improvement'} color={passed ? 'success' : 'error'} sx={{ mt: 1 }} />
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Performance Summary</Typography>
              {[
                { label: 'Correct', value: result.correct_count, color: '#4caf50' },
                { label: 'Wrong', value: result.wrong_count, color: '#f44336' },
                { label: 'Unattempted', value: result.unattempted_count, color: '#9e9e9e' },
              ].map(item => (
                <Box key={item.label} mb={1} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>{item.label}</Typography>
                  <Typography fontWeight="bold" color={item.color}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {chapterData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>Chapter-wise Analysis</Typography>
            {chapterData.map((ch, i) => {
              const pct = ch.total > 0 ? (ch.correct / ch.total) * 100 : 0;
              return (
                <Box key={i} mb={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{ch.chapter_name}</Typography>
                    <Typography>{ch.correct}/{ch.total} ({pct.toFixed(0)}%)</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pct}
                    color={pct >= 70 ? 'success' : pct >= 40 ? 'warning' : 'error'} />
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {result.ai_overall_feedback && (
        <Card sx={{ mb: 4, borderRadius: 3, borderLeft: '6px solid #7c3aed' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} mb={2} color="#7c3aed">AI Analysis & Recommendations</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'text.secondary' }}>{result.ai_overall_feedback}</Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h5" fontWeight={800} mb={3}>Detailed Question Review</Typography>
      <Stack spacing={3} mb={5}>
        {(result.answers || []).map((ans, idx) => {
          const isCorrect = ans.is_correct;
          const isUnattempted = !ans.selected_option;
          const correctLetter = (ans.correct_answer || '').replace('option_', '').toUpperCase();
          const selectedLetter = ans.selected_option;

          return (
            <Card key={ans.id} variant="outlined" sx={{ 
              borderRadius: 3, 
              borderColor: isUnattempted ? '#e2e8f0' : (isCorrect ? '#22c55e' : '#ef4444'),
              bgcolor: isUnattempted ? 'transparent' : (isCorrect ? '#f0fdf4' : '#fef2f2')
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                    QUESTION {idx + 1}
                  </Typography>
                  <Chip 
                    icon={isUnattempted ? <HelpOutlineIcon /> : (isCorrect ? <CheckCircleIcon /> : <CancelIcon />)}
                    label={isUnattempted ? 'Unattempted' : (isCorrect ? 'Correct' : 'Incorrect')}
                    size="small"
                    color={isUnattempted ? 'default' : (isCorrect ? 'success' : 'error')}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="body1" fontWeight={700} mb={3}>{ans.question_text}</Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
                  {['A', 'B', 'C', 'D'].map(letter => {
                    const optText = ans[`option_${letter.toLowerCase()}`];
                    if (!optText) return null;
                    const isSelected = selectedLetter === letter;
                    const isThisCorrect = correctLetter === letter;

                    return (
                      <Paper 
                        key={letter} 
                        variant="outlined" 
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          gap: 1.5,
                          borderRadius: 2,
                          bgcolor: isThisCorrect ? '#dcfce7' : (isSelected ? '#fee2e2' : '#fff'),
                          borderColor: isThisCorrect ? '#22c55e' : (isSelected ? '#ef4444' : '#e2e8f0'),
                          borderWidth: (isThisCorrect || isSelected) ? 2 : 1
                        }}
                      >
                        <Typography fontWeight={800} color={isThisCorrect ? '#166534' : (isSelected ? '#991b1b' : 'text.secondary')}>
                          {letter}.
                        </Typography>
                        <Typography variant="body2">{optText}</Typography>
                      </Paper>
                    );
                  })}
                </Box>

                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.5)', 
                  borderRadius: 2, 
                  border: '1px dashed',
                  borderColor: isCorrect ? '#22c55e' : '#ef4444'
                }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={800}>
                      Correct Answer: <Box component="span" sx={{ color: '#166534' }}>{correctLetter}</Box>
                    </Typography>
                    {!isUnattempted && (
                      <Typography variant="body2" fontWeight={800}>
                        Your Answer: <Box component="span" sx={{ color: isCorrect ? '#166534' : '#991b1b' }}>{selectedLetter}</Box>
                      </Typography>
                    )}
                    {ans.explanation && (
                      <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <Typography variant="caption" fontWeight={800} color="text.secondary" display="block">EXPLANATION:</Typography>
                        <Typography variant="body2" color="text.secondary">{ans.explanation}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>Practice Again</Button>
      </Box>
    </Box>
  );
}

export default withAuth(ResultView);
