import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Tab, Tabs,
  MenuItem, Select, InputLabel, FormControl, Avatar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { withAdmin } from '@/components/withAuth';
import api from '@/lib/axios';

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('pending');
  const [approveDialog, setApproveDialog] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', password2: '', role: 'student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = (s = tab) => {
    api.get('/auth/requests/?status=' + s).then(res => setRequests(res.data.results || res.data));
  };

  useEffect(() => { fetchRequests(tab); }, [tab]);

  const handleApprove = async () => {
    setError('');
    try {
      const res = await api.post('/auth/requests/' + approveDialog.id + '/approve/', form);
      setSuccess('Account created: @' + res.data.user.username);
      setApproveDialog(null);
      setForm({ username: '', password: '', password2: '', role: 'student' });
      fetchRequests();
    } catch (err) {
      const d = err.response?.data;
      setError(d ? Object.values(d).flat().join(' ') : 'Failed to create account.');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this request?')) return;
    await api.post('/auth/requests/' + id + '/reject/');
    fetchRequests();
  };

  const roleStyle = {
    student: { bg: '#ede9fe', color: '#5b21b6' },
    instructor: { bg: '#fce7f3', color: '#9d174d' },
  };
  const statusStyle = {
    pending: { bg: '#fff7ed', color: '#c2410c' },
    approved: { bg: '#d1fae5', color: '#065f46' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%)',
        borderRadius: 3, p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(168,85,247,0.3)', filter: 'blur(25px)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" color="#fff" fontWeight={800}>Registration Requests</Typography>
          <Typography color="rgba(255,255,255,0.65)" mt={0.3} fontSize="0.9rem">
            Review and approve student / instructor access requests
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2.5, px: 2, py: 1, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography fontWeight={800} color="#fff" fontSize="1.5rem" lineHeight={1}>{requests.length}</Typography>
          <Typography color="rgba(255,255,255,0.7)" fontSize="0.75rem">{tab}</Typography>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #f5f0ff, #ede9fe)', borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
          </Tabs>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Exam Interested</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                {tab === 'pending' && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(r => {
                const rs = roleStyle[r.role] || roleStyle.student;
                const ss = statusStyle[r.status] || statusStyle.pending;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, background: `linear-gradient(135deg, ${rs.color}44, ${rs.color}99)`, color: rs.color, fontSize: 14, fontWeight: 800 }}>
                          {r.full_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{r.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.role || 'student'} size="small" sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 700, textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell><Typography variant="body2">{r.phone}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{r.exam_interested_name || '—'}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.message || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{new Date(r.requested_at).toLocaleDateString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" sx={{ bgcolor: ss.bg, color: ss.color, fontWeight: 700, textTransform: 'capitalize' }} />
                    </TableCell>
                    {tab === 'pending' && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button size="small" variant="contained"
                            onClick={() => { setApproveDialog(r); setError(''); setForm({ username: '', password: '', password2: '', role: r.role || 'student' }); }}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleReject(r.id)}>
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                    <HourglassEmptyIcon sx={{ fontSize: 44, color: '#c4b5fd', display: 'block', mx: 'auto', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>No {tab} requests</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Approve Dialog */}
      <Dialog open={!!approveDialog} onClose={() => setApproveDialog(null)} maxWidth="sm" fullWidth>
        <Box sx={{ background: 'linear-gradient(135deg, #3b0764, #7c3aed)', p: 3, borderRadius: '20px 20px 0 0' }}>
          <Typography variant="h6" color="#fff" fontWeight={800}>Approve Request</Typography>
          <Typography color="rgba(255,255,255,0.7)" fontSize="0.875rem">
            Creating account for <strong>{approveDialog?.full_name}</strong>
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Username" margin="normal" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })} required helperText="Login username" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={e => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="Password" type="password" margin="normal" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={form.password2}
            onChange={e => setForm({ ...form, password2: e.target.value })} required />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button onClick={() => setApproveDialog(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleApprove} startIcon={<CheckIcon />}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdmin(RequestsPage);
