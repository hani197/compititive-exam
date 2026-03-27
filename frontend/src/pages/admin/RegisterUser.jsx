import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, MenuItem,
  Select, InputLabel, FormControl, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
  Divider, Accordion, AccordionSummary, AccordionDetails, CircularProgress, IconButton, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import SchoolIcon from '@mui/icons-material/School';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import HomeIcon from '@mui/icons-material/Home';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

const emptyForm = { 
  username: '', email: '', first_name: '', last_name: '', password: '', password2: '', 
  role: 'student', phone: '', date_of_birth: '', address: '', qualification: '',
  parent_name: '', parent_phone: '', age: '', exam_type: '',
  tenth_percentage: '', tenth_year: '',
  intermediate_percentage: '', intermediate_year: '',
  degree_type: '', degree_percentage: '', degree_year: '',
  experience_years: '', faculty_field: '', work_history: '' 
};

function RegisterUser() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [expanded, setExpanded] = useState('panel1');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewUser, setViewUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [u, e] = await Promise.all([
        api.get('/auth/students/'),
        api.get('/exam-types/')
      ]);
      setUsers(u.data?.results || u.data || []);
      setExamTypes(e.data?.results || e.data || []);
    } catch (err) { 
      console.error(err); 
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (form.date_of_birth) {
      const birthDate = new Date(form.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm(prev => ({ ...prev, age: age > 0 ? age : 0 }));
    }
  }, [form.date_of_birth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (!editingId && form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    const submissionData = { ...form };
    
    // Clean numeric/date fields: empty string -> null
    const numericFields = [
      'age', 'tenth_percentage', 'tenth_year', 'intermediate_percentage', 
      'intermediate_year', 'degree_percentage', 'degree_year', 'experience_years', 'exam_type'
    ];
    numericFields.forEach(field => {
      if (submissionData[field] === '') submissionData[field] = null;
    });
    if (submissionData.date_of_birth === '') submissionData.date_of_birth = null;

    if (form.role === 'student') {
      ['experience_years', 'faculty_field', 'work_history'].forEach(k => delete submissionData[k]);
    } else {
      ['parent_name', 'parent_phone', 'age', 'exam_type', 'tenth_percentage', 'tenth_year', 'intermediate_percentage', 'intermediate_year', 'degree_type', 'degree_percentage', 'degree_year'].forEach(k => delete submissionData[k]);
    }

    if (editingId && !submissionData.password) {
      delete submissionData.password;
      delete submissionData.password2;
    }

    try {
      if (editingId) {
        await api.patch(`/auth/students/${editingId}/`, submissionData);
        setSuccess('Profile updated successfully.');
      } else {
        const res = await api.post('/auth/students/register/', submissionData);
        setSuccess('Account created for ' + (res.data.first_name || res.data.username));
      }
      cancelEdit();
      fetchData();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log out and log in again.');
      } else if (err.response?.data) {
        // Extract field-specific errors
        const data = err.response.data;
        const messages = Object.entries(data).map(([field, errors]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
          return `${fieldName}: ${Array.isArray(errors) ? errors.join(' ') : errors}`;
        });
        setError(messages.join(' | ') || 'Action failed.');
      } else {
        setError('Action failed. Check network connection.');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ ...emptyForm, ...user, password: '', password2: '' });
    setExpanded('panel1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/auth/students/${id}/`);
      setSuccess('User deleted.');
      fetchData();
    } catch (err) { setError('Failed to delete.'); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExpanded('panel1');
  };

  const handleView = (user) => { setViewUser(user); setIsViewOpen(true); };
  const closeView = () => { setViewUser(null); setIsViewOpen(false); };
  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const roleStyle = {
    student: { bg: '#ede9fe', color: '#5b21b6', grad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    instructor: { bg: '#fce7f3', color: '#9d174d', grad: 'linear-gradient(135deg, #db2777, #ec4899)' },
    admin: { bg: '#dbeafe', color: '#1e40af', grad: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
  };

  const getAvatarStyle = (username) => {
    const colors = [
      'linear-gradient(135deg, #f97316, #fbbf24)', // Orange
      'linear-gradient(135deg, #7c3aed, #a855f7)', // Purple
      'linear-gradient(135deg, #0891b2, #06b6d4)', // Cyan
      'linear-gradient(135deg, #059669, #10b981)', // Green
      'linear-gradient(135deg, #db2777, #ec4899)', // Pink
      'linear-gradient(135deg, #1d4ed8, #3b82f6)', // Blue
    ];
    const index = username.length % colors.length;
    return { background: colors[index], fontWeight: 800 };
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%)', borderRadius: 3, p: 3, mb: 3, color: '#fff' }}>
        <Typography variant="h5" fontWeight={800}>User Management</Typography>
        <Typography color="rgba(255,255,255,0.65)" mt={0.3} fontSize="0.9rem">Register and manage coaching profiles</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Form */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>{editingId ? 'Edit User' : 'New Registration'}</Typography>
            {editingId && <Button size="small" variant="outlined" color="error" onClick={cancelEdit}>Cancel</Button>}
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <Accordion expanded={expanded === 'panel1'} onChange={(e, ex) => setExpanded(ex ? 'panel1' : false)} sx={{ borderRadius: '12px !important', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Personal Details</Typography></AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select value={form.role} label="Role" onChange={set('role')}>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="instructor">Instructor</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField fullWidth label="First Name" value={form.first_name} onChange={set('first_name')} required size="small" />
                    <TextField fullWidth label="Last Name" value={form.last_name} onChange={set('last_name')} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField fullWidth label="Mobile" value={form.phone} onChange={set('phone')} required size="small" />
                    <TextField fullWidth label="DOB" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} size="small" InputLabelProps={{ shrink: true }} />
                  </Box>
                  <TextField fullWidth label="Address" value={form.address} onChange={set('address')} size="small" multiline rows={2} />
                  {form.role === 'student' && (
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                      <TextField fullWidth label="Age" value={form.age} InputProps={{ readOnly: true }} size="small" />
                      <FormControl fullWidth size="small">
                        <InputLabel>Exam Program</InputLabel>
                        <Select value={form.exam_type} label="Exam Program" onChange={set('exam_type')}>
                          {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {form.role === 'student' && (
              <Accordion expanded={expanded === 'panel_parent'} onChange={(e, ex) => setExpanded(ex ? 'panel_parent' : false)} sx={{ borderRadius: '12px !important', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Parent Details</Typography></AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Parent Name" value={form.parent_name} onChange={set('parent_name')} size="small" />
                    <TextField fullWidth label="Parent Mobile" value={form.parent_phone} onChange={set('parent_phone')} size="small" />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            <Accordion expanded={expanded === 'panel2'} onChange={(e, ex) => setExpanded(ex ? 'panel2' : false)} sx={{ borderRadius: '12px !important', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Qualification & Academics</Typography></AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField fullWidth label="Highest Qualification" value={form.qualification} onChange={set('qualification')} size="small" placeholder="e.g. B.Tech, M.Sc" />
                  
                  {form.role === 'student' && (
                    <>
                      <Divider><Chip label="10th Class" size="small" /></Divider>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField fullWidth label="10th %" type="number" value={form.tenth_percentage} onChange={set('tenth_percentage')} size="small" />
                        <TextField fullWidth label="Year of Passing" type="number" value={form.tenth_year} onChange={set('tenth_year')} size="small" />
                      </Box>

                      <Divider><Chip label="Intermediate / 12th" size="small" /></Divider>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField fullWidth label="Inter %" type="number" value={form.intermediate_percentage} onChange={set('intermediate_percentage')} size="small" />
                        <TextField fullWidth label="Year of Passing" type="number" value={form.intermediate_year} onChange={set('intermediate_year')} size="small" />
                      </Box>

                      <Divider><Chip label="Degree / Graduation" size="small" /></Divider>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField fullWidth label="Degree %" type="number" value={form.degree_percentage} onChange={set('degree_percentage')} size="small" />
                        <TextField fullWidth label="Year of Passing" type="number" value={form.degree_year} onChange={set('degree_year')} size="small" />
                      </Box>
                    </>
                  )}

                  {form.role === 'instructor' && (
                    <Stack spacing={2.5}>
                      <Divider><Chip label="Professional Experience" size="small" /></Divider>
                      <TextField fullWidth label="Years of Experience" type="number" value={form.experience_years} onChange={set('experience_years')} size="small" />
                      <TextField fullWidth label="Subject Expertise / Field" value={form.faculty_field} onChange={set('faculty_field')} size="small" />
                      <TextField fullWidth label="Work History / Previous Orgs" value={form.work_history} onChange={set('work_history')} size="small" multiline rows={2} />
                    </Stack>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion expanded={expanded === 'panel3'} onChange={(e, ex) => setExpanded(ex ? 'panel3' : false)} sx={{ borderRadius: '12px !important', mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={700}>Credentials</Typography></AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Username" value={form.username} onChange={set('username')} required size="small" />
                  <TextField fullWidth label="Email" type="email" value={form.email} onChange={set('email')} required size="small" />
                  <TextField fullWidth label="Password" type="password" value={form.password} onChange={set('password')} required={!editingId} size="small" />
                  {!editingId && <TextField fullWidth label="Confirm" type="password" value={form.password2} onChange={set('password2')} required size="small" />}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}>{editingId ? 'Update' : 'Create'} Account</Button>
          </form>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Registered Users</Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table size="small">
              <TableHead><TableRow><TableCell sx={{ fontWeight: 800 }}>User</TableCell><TableCell sx={{ fontWeight: 800 }}>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 12, ...getAvatarStyle(u.username) }}>
                          {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                        </Avatar>
                        <Box><Typography variant="body2" fontWeight={700}>{u.first_name || u.username}</Typography></Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={u.role} size="small" sx={{ fontSize: 10, height: 20 }} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleView(u)}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(u)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={isViewOpen} onClose={closeView} maxWidth="xs" fullWidth>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          <List>
            <ListItem><ListItemText primary="Name" secondary={`${viewUser?.first_name} ${viewUser?.last_name}`} /></ListItem>
            <ListItem><ListItemText primary="Email" secondary={viewUser?.email} /></ListItem>
            <ListItem><ListItemText primary="Phone" secondary={viewUser?.phone} /></ListItem>
            <ListItem><ListItemText primary="Address" secondary={viewUser?.address} /></ListItem>
          </List>
        </DialogContent>
        <DialogActions><Button onClick={closeView}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdmin(RegisterUser);
