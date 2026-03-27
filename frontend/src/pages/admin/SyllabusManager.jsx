import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Stack, 
  Breadcrumbs, Link, Chip, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function SyllabusManager() {
  const [level, setLevel] = useState('exams'); // 'exams', 'subjects', 'chapters'
  const [exam, setExam] = useState(null);
  const [subject, setSubject] = useState(null);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dialog, setDialog] = useState({ open: false, type: 'add', item: null });
  const [form, setForm] = useState({ name: '', code: '', description: '', order: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/exam-types/';
      if (level === 'subjects') url = `/subjects/?exam_type=${exam.id}`;
      if (level === 'chapters') url = `/chapters/?subject=${subject.id}`;
      
      const res = await api.get(url);
      setData(res.data.results || res.data || []);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [level, exam, subject]);

  const handleOpenDialog = (type, item = null) => {
    setDialog({ open: true, type, item });
    if (item) {
      setForm({ name: item.name, code: item.code || '', description: item.description || '', order: item.order || 0 });
    } else {
      setForm({ name: '', code: '', description: '', order: 0 });
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (level === 'subjects') payload.exam_type = exam.id;
      if (level === 'chapters') payload.subject = subject.id;

      if (dialog.type === 'edit') {
        let url = `/exam-types/${dialog.item.id}/`;
        if (level === 'subjects') url = `/subjects/${dialog.item.id}/`;
        if (level === 'chapters') url = `/chapters/${dialog.item.id}/`;
        await api.patch(url, payload);
      } else {
        let url = '/exam-types/';
        if (level === 'subjects') url = '/subjects/';
        if (level === 'chapters') url = '/chapters/';
        await api.post(url, payload);
      }
      setDialog({ open: false, type: 'add', item: null });
      fetchData();
    } catch (err) {
      alert('Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This may affect linked data.')) return;
    try {
      let url = `/exam-types/${id}/`;
      if (level === 'subjects') url = `/subjects/${id}/`;
      if (level === 'chapters') url = `/chapters/${id}/`;
      await api.delete(url);
      fetchData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const navigateToExams = () => { setLevel('exams'); setExam(null); setSubject(null); };
  const navigateToSubjects = (e) => { setExam(e); setLevel('subjects'); setSubject(null); };
  const navigateToChapters = (s) => { setSubject(s); setLevel('chapters'); };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>Syllabus Management</Typography>
          <Breadcrumbs separator={<ArrowForwardIosIcon sx={{ fontSize: 10 }} />}>
            <Link component="button" onClick={navigateToExams} underline="hover" color={level === 'exams' ? 'primary' : 'inherit'} sx={{ fontWeight: level === 'exams' ? 700 : 400 }}>Exams</Link>
            {exam && <Link component="button" onClick={() => navigateToSubjects(exam)} underline="hover" color={level === 'subjects' ? 'primary' : 'inherit'} sx={{ fontWeight: level === 'subjects' ? 700 : 400 }}>{exam.name}</Link>}
            {subject && <Typography color="primary" sx={{ fontWeight: 700 }}>{subject.name}</Typography>}
          </Breadcrumbs>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('add')}>
          Add {level.slice(0, -1)}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                {level === 'exams' && <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>}
                <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      {level !== 'chapters' && (
                        <IconButton size="small" onClick={() => level === 'exams' ? navigateToSubjects(item) : navigateToChapters(item)}>
                          <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                  </TableCell>
                  {level === 'exams' && <TableCell><Chip label={item.code} size="small" /></TableCell>}
                  <TableCell>{item.order || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog('edit', item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No {level} found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} fullWidth maxWidth="sm">
        <DialogTitle>{dialog.type === 'add' ? 'Add' : 'Edit'} {level.slice(0, -1).toUpperCase()}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} size="small" />
            {level === 'exams' && <TextField fullWidth label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} size="small" />}
            <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} size="small" />
            <TextField fullWidth label="Display Order" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAdmin(SyllabusManager);
