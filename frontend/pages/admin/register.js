import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, MenuItem,
  Select, InputLabel, FormControl, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, Grid
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import { withAdmin } from '@/components/withAuth';
import api from '@/lib/axios';

const emptyForm = { username: '', email: '', first_name: '', last_name: '', password: '', password2: '', role: 'student', phone: '' };

function RegisterStudentPage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);

  const fetchUsers = () => api.get('/auth/students/').then(res => setUsers(res.data.results || res.data));
  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const res = await api.post('/auth/students/register/', form);
      setSuccess('Account created for ' + (res.data.first_name || res.data.username));
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      setError(data && typeof data === 'object'
        ? Object.entries(data).map(([k, v]) => k + ': ' + (Array.isArray(v) ? v.join(', ') : v)).join(' | ')
        : 'Registration failed.');
    }
  };

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const roleStyle = {
    student: { bg: '#ede9fe', color: '#5b21b6', grad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    instructor: { bg: '#fce7f3', color: '#9d174d', grad: 'linear-gradient(135deg, #db2777, #ec4899)' },
    admin: { bg: '#dbeafe', color: '#1e40af', grad: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%)',
        borderRadius: 3, p: 3, mb: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', right: -30, bottom: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(249,115,22,0.25)', filter: 'blur(30px)' }} />
        <Typography variant="h5" color="#fff" fontWeight={800}>User Management</Typography>
        <Typography color="rgba(255,255,255,0.65)" mt={0.3} fontSize="0.9rem">
          Create accounts directly for students and instructors
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)',
              p: 2.5, borderBottom: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', borderRadius: 2, p: 1, display: 'flex' }}>
                <PersonAddIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>Create Account</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth label="First Name" value={form.first_name} onChange={set('first_name')} required size="small" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.last_name} onChange={set('last_name')} size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Username" value={form.username} onChange={set('username')} required size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={form.email} onChange={set('email')} required size="small" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={set('phone')} size="small" /></Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Role</InputLabel>
                      <Select value={form.role} label="Role" onChange={set('role')}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}><TextField fullWidth label="Password" type="password" value={form.password} onChange={set('password')} required size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Confirm Password" type="password" value={form.password2} onChange={set('password2')} required size="small" /></Grid>
                </Grid>
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.3 }} startIcon={<PersonAddIcon />}>
                  Create Account
                </Button>
              </form>
            </Box>
          </Paper>
        </Grid>

        {/* Table */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)',
              p: 2.5, borderBottom: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', gap: 1.5,
            }}>
              <Box sx={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)', borderRadius: 2, p: 1, display: 'flex' }}>
                <PeopleIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>Registered Users</Typography>
                <Typography variant="caption" color="text.secondary">{users.length} total</Typography>
              </Box>
            </Box>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => {
                    const rs = roleStyle[u.role] || roleStyle.student;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, background: rs.grad, fontSize: 12, fontWeight: 800 }}>
                              {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.first_name} {u.last_name}</Typography>
                              <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small" sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 700, textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell><Typography variant="body2">{u.phone || '—'}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{new Date(u.created_at).toLocaleDateString()}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: '#c4b5fd', display: 'block', mx: 'auto', mb: 1 }} />
                        <Typography color="text.secondary">No users registered yet</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAdmin(RegisterStudentPage);
