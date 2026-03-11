import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Button, Chip, LinearProgress
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { withAuth } from '@/components/withAuth';
import api from '@/lib/axios';

const COLORS = ['#4caf50', '#f44336', '#9e9e9e'];

function ResultPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.get('/results/?session=' + sessionId).then(res => {
      const list = res.data.results || res.data;
      if (list.length > 0) setResult(list[0]);
    }).finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!result) return <Box sx={{ p: 3 }}><Typography>Result not found.</Typography></Box>;

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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>AI Analysis & Recommendations</Typography>
            <Typography style={{ whiteSpace: 'pre-wrap' }}>{result.ai_overall_feedback}</Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        <Button variant="outlined" onClick={() => router.back()}>Practice Again</Button>
      </Box>
    </Box>
  );
}

export default withAuth(ResultPage);
