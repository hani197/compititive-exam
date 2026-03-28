import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem,
  Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, IconButton, Tooltip, CircularProgress, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
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
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, assignRes] = await Promise.all([
        api.get('auth/students/'),
        api.get('auth/assignments/')
      ]);
      const allUsers = userRes.data.results || userRes.data || [];
      setStudents(allUsers.filter(u => u.role === 'student'));
      setInstructors(allUsers.filter(u => u.role === 'instructor'));
      setAssignments(assignRes.data.results || assignRes.data || []);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.student || !form.instructor) {
      setError('Please select both a student and an instructor.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`auth/assignments/${editingId}/`, form);
        setSuccess('Assignment updated successfully!');
      } else {
        await api.post('auth/assignments/', form);
        setSuccess('Assignment created successfully!');
      }
      cancelEdit();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Action failed.');
    }
  };

  const handleEdit = (assign) => {
    setEditingId(assign.id);
    setForm({
      student: assign.student,
      instructor: assign.instructor,
      notes: assign.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ student: '', instructor: '', notes: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await api.delete(`auth/assignments/${id}/`);
      setSuccess('Assignment removed.');
      fetchData();
    } catch (err) {
      setError('Failed to delete assignment.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1e0546 0%, #4c1d95 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff'
      }}>
        <Typography variant="h5" fontWeight={800}>Student-Instructor Assignments</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Assign personal mentors to your students</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Assignment Form */}
        <Box sx={{ flex: { xs: '1 1 auto', md: '1 1 350px' } }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit Assignment' : 'New Assignment'}</Typography>
              {editingId && (
                <IconButton size="small" color="error" onClick={cancelEdit}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <form onSubmit={handleAssign}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size="small">
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

                <FormControl fullWidth size="small">
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
                  startIcon={editingId ? <EditIcon /> : <PersonAddIcon />}
                  color={editingId ? "warning" : "primary"}
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  {editingId ? 'Update Assignment' : 'Assign Now'}
                </Button>
                {editingId && (
                  <Button fullWidth variant="text" color="inherit" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </form>
          </Paper>
        </Box>

        {/* Assignments Table */}
        <Box sx={{ flex: 1 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Instructor</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{row.student_detail?.username?.[0] || 'S'}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{row.student_detail?.first_name} {row.student_detail?.last_name}</Typography>
                          <Typography variant="caption" color="text.secondary">@{row.student_detail?.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12 }}>{row.instructor_detail?.username?.[0] || 'I'}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{row.instructor_detail?.first_name} {row.instructor_detail?.last_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.instructor_detail?.faculty_field || 'Faculty'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(row)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No assignments found</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default withAdmin(Assignments);
