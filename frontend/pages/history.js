import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, CircularProgress
} from '@mui/material';
import { withAuth } from '@/components/withAuth';
import api from '@/lib/axios';

function HistoryPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/results/').then(res => {
      setResults(res.data.results || res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>Exam History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.exam_name}</TableCell>
                <TableCell>{r.subject_name}</TableCell>
                <TableCell>{r.percentage.toFixed(1)}%</TableCell>
                <TableCell>{r.obtained_marks}/{r.total_marks}</TableCell>
                <TableCell>
                  <Chip label={r.percentage >= 60 ? 'Passed' : 'Failed'}
                    color={r.percentage >= 60 ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>{new Date(r.evaluated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => router.push('/result/' + r.session)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No exams taken yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default withAuth(HistoryPage);
