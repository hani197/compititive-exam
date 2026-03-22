import { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Alert, MenuItem,
  Select, InputLabel, FormControl, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, Grid,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import SchoolIcon from '@mui/icons-material/School';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
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

  const fetchData = async () => {
    try {
      const [u, e] = await Promise.all([
        api.get('/auth/students/'),
        api.get('/exam-types/')
      ]);
      setUsers(u.data.results || u.data);
      setExamTypes(e.data.results || e.data);
    } catch (err) { console.error(err); }
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
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await api.post('/auth/students/register/', form);
      setSuccess('Account created for ' + (res.data.first_name || res.data.username));
      setForm(emptyForm);
      setExpanded('panel1');
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      setError(data && typeof data === 'object'
        ? Object.entries(data).map(([k, v]) => k + ': ' + (Array.isArray(v) ? v.join(', ') : v)).join(' | ')
        : 'Registration failed.');
    }
  };

  const set = f => e => setForm({ ...form, [f]: e.target.value });
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const roleStyle = {
    student: { bg: '#ede9fe', color: '#5b21b6', grad: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    instructor: { bg: '#fce7f3', color: '#9d174d', grad: 'linear-gradient(135deg, #db2777, #ec4899)' },
    admin: { bg: '#dbeafe', color: '#1e40af', grad: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 60%, #7c3aed 100%)',
        borderRadius: 3, p: 3, mb: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', right: -30, bottom: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(249,115,22,0.25)', filter: 'blur(30px)' }} />
        <Typography variant="h5" color="#fff" fontWeight={800}>User Management</Typography>
        <Typography color="rgba(255,255,255,0.65)" mt={0.3} fontSize="0.9rem">
          Register new students and instructors with detailed profiles
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Registration Form Sections */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon color="primary" /> Registration Form
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Personal Details */}
            <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')} sx={{ borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ContactPageIcon color="primary" fontSize="small" />
                  <Typography fontWeight={700}>Personal Details</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Role</InputLabel>
                      <Select value={form.role} label="Role" onChange={set('role')}>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}><TextField fullWidth label="First Name" value={form.first_name} onChange={set('first_name')} required size="small" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.last_name} onChange={set('last_name')} size="small" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label={form.role === 'student' ? "Candidate Mobile" : "Phone"} value={form.phone} onChange={set('phone')} required size="small" /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                  {form.role === 'student' && (
                    <>
                      <Grid item xs={6}><TextField fullWidth label="Candidate Age" type="number" value={form.age} InputProps={{ readOnly: true }} size="small" helperText="Auto-calculated from DOB" /></Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Joining for Exam Coaching</InputLabel>
                          <Select value={form.exam_type} label="Joining for Exam Coaching" onChange={set('exam_type')}>
                            {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={set('address')} size="small" multiline rows={2} /></Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 2: Parent / Guardian Details (Student Only) */}
            {form.role === 'student' && (
              <Accordion expanded={expanded === 'panel_parent'} onChange={handleAccordionChange('panel_parent')} sx={{ borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SupervisorAccountIcon color="primary" fontSize="small" />
                    <Typography fontWeight={700}>Parent / Guardian Details</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Parent / Guardian Name" value={form.parent_name} onChange={set('parent_name')} size="small" /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Parent Mobile Number" value={form.parent_phone} onChange={set('parent_phone')} size="small" /></Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Section 3: Qualification Details */}
            <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')} sx={{ borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolIcon color="primary" fontSize="small" />
                  <Typography fontWeight={700}>Qualification Section</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField fullWidth label="Highest Qualification" value={form.qualification} onChange={set('qualification')} size="small" placeholder="e.g. B.Tech in CSE" /></Grid>
                  
                  {form.role === 'student' && (
                    <>
                      <Grid item xs={12}><Typography variant="caption" fontWeight={700} color="text.secondary">10TH CLASS</Typography></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Year of Study" type="number" value={form.tenth_year} onChange={set('tenth_year')} size="small" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Percentage Obtained" type="number" value={form.tenth_percentage} onChange={set('tenth_percentage')} size="small" /></Grid>
                      
                      <Grid item xs={12}><Typography variant="caption" fontWeight={700} color="text.secondary">INTERMEDIATE</Typography></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Year of Study" type="number" value={form.intermediate_year} onChange={set('intermediate_year')} size="small" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Percentage Obtained" type="number" value={form.intermediate_percentage} onChange={set('intermediate_percentage')} size="small" /></Grid>
                      
                      <Grid item xs={12}><Typography variant="caption" fontWeight={700} color="text.secondary">DEGREE</Typography></Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Degree Type</InputLabel>
                          <Select value={form.degree_type} label="Degree Type" onChange={set('degree_type')}>
                            <MenuItem value="BSc">BSc</MenuItem>
                            <MenuItem value="BCom">BCom</MenuItem>
                            <MenuItem value="BTech">BTech</MenuItem>
                            <MenuItem value="BA">BA</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}><TextField fullWidth label="Year of Study" type="number" value={form.degree_year} onChange={set('degree_year')} size="small" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Percentage Obtained" type="number" value={form.degree_percentage} onChange={set('degree_percentage')} size="small" /></Grid>
                    </>
                  )}

                  {form.role === 'instructor' && (
                    <>
                      <Grid item xs={6}><TextField fullWidth label="Experience (Years)" type="number" value={form.experience_years} onChange={set('experience_years')} size="small" /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="Faculty Field" value={form.faculty_field} onChange={set('faculty_field')} size="small" placeholder="e.g. Mathematics" /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Work History" value={form.work_history} onChange={set('work_history')} size="small" multiline rows={2} placeholder="Previous company/college details" /></Grid>
                    </>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Section 4: Credentials */}
            <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')} sx={{ borderRadius: '12px !important', mb: 3, '&:before': { display: 'none' }, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <VpnKeyIcon color="primary" fontSize="small" />
                  <Typography fontWeight={700}>Credential Details</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField fullWidth label="Username" value={form.username} onChange={set('username')} required size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={form.email} onChange={set('email')} required size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Password" type="password" value={form.password} onChange={set('password')} required size="small" /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Confirm Password" type="password" value={form.password2} onChange={set('password2')} required size="small" /></Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }} startIcon={<PersonAddIcon />}>
              Create {form.role.toUpperCase()} Account
            </Button>
          </form>
        </Grid>

        {/* User List Table */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon color="secondary" /> Registered Users
          </Typography>
          <Paper sx={{ overflow: 'hidden', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>Exam / Qualification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => {
                    const rs = roleStyle[u.role] || roleStyle.student;
                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, background: rs.grad, fontSize: 13, fontWeight: 800 }}>
                              {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.first_name} {u.last_name}</Typography>
                              <Typography variant="caption" color="text.secondary">@{u.username}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={u.role} size="small" sx={{ bgcolor: rs.bg, color: rs.color, fontWeight: 700, textTransform: 'capitalize', fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell>
                          {u.role === 'student' ? (
                            <Typography variant="caption" fontWeight={700} color="primary">{u.exam_type_name || 'No Exam Set'}</Typography>
                          ) : (
                            <Typography variant="caption" fontWeight={600}>{u.qualification || '—'}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                        <PeopleIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1 }} />
                        <Typography color="text.secondary">No users found</Typography>
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

export default withAdmin(RegisterUser);
