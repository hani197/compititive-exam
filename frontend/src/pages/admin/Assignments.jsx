import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, FormControl, InputLabel, Select, MenuItem,
  Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function Assignments() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ student: '', instructor: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, assignRes] = await Promise.all([
        api.get('/auth/students/'),
        api.get('/auth/assignments/')
      ]);
      const allUsers = userRes.data.results || userRes.data;
      setStudents(allUsers.filter(u => u.role === 'student'));
      setInstructors(allUsers.filter(u => u.role === 'instructor'));
      setAssignments(assignRes.data.results || assignRes.data);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.student || !form.instructor) {
      setError('Please select both a student and an instructor.');
      return;
    }
    try {
      await api.post('/auth/assignments/', form);
      setSuccess('Assignment created successfully!');
      setForm({ student: '', instructor: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Assignment already exists or failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await api.delete(`/auth/assignments/${id}/`);
      fetchData();
    } catch (err) {
      setError('Failed to delete assignment.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1e0546 0%, #4c1d95 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff'
      }}>
        <Typography variant="h5" fontWeight={800}>Student-Instructor Assignments</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Assign personal mentors to your students</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Assignment Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>New Assignment</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <form onSubmit={handleAssign}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={form.student}
                  label="Select Student"
                  onChange={e => setForm({ ...form, student: e.target.value })}
                >
                  {students.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.first_name} {s.last_name} (@{s.username})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Select Instructor</InputLabel>
                <Select
                  value={form.instructor}
                  label="Select Instructor"
                  onChange={e => setForm({ ...form, instructor: e.target.value })}
                >
                  {instructors.map(i => (
                    <MenuItem key={i.id} value={i.id}>{i.first_name} {i.last_name} (@{i.username})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button 
                fullWidth variant="contained" type="submit" 
                startIcon={<PersonAddIcon />}
                sx={{ py: 1.2, borderRadius: 2 }}
              >
                Assign Now
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Assignments Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Instructor</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#ede9fe', color: '#5b21b6', fontSize: 12 }}>
                          {row.student_detail.first_name?.[0] || 'S'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {row.student_detail.first_name} {row.student_detail.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">@{row.student_detail.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#fdf2f8', color: '#9d174d', fontSize: 12 }}>
                          {row.instructor_detail.first_name?.[0] || 'I'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {row.instructor_detail.first_name} {row.instructor_detail.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{row.instructor_detail.faculty_field || 'Faculty'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove Assignment">
                        <IconButton color="error" onClick={() => handleDelete(row.id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <PeopleIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1 }} />
                      <Typography color="text.secondary">No assignments found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAdmin(Assignments);
