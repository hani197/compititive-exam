import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Alert, MenuItem,
  Select, InputLabel, FormControl, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import HistoryIcon from '@mui/icons-material/History';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

function OldPapers() {
  const [papers, setPapers] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', year: new Date().getFullYear(), exam_type: '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, eRes] = await Promise.all([
        api.get('/papers/old-papers/'),
        api.get('/exam-types/')
      ]);
      setPapers(pRes.data.results || pRes.data);
      setExamTypes(eRes.data.results || eRes.data);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !form.exam_type || !form.title) {
      setError('Please fill all required fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.title);
    formData.append('year', form.year);
    formData.append('exam_type', form.exam_type);
    formData.append('description', form.description);

    try {
      await api.post('/papers/old-papers/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Paper uploaded successfully!');
      setForm({ title: '', year: new Date().getFullYear(), exam_type: '', description: '' });
      setFile(null);
      fetchData();
    } catch (err) {
      setError('Upload failed. Please check your inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this paper?')) return;
    try {
      await api.delete(`/papers/old-papers/${id}/`);
      fetchData();
    } catch (err) {
      setError('Failed to delete paper.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff'
      }}>
        <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <HistoryIcon /> Previous Year Papers
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Upload and manage old exam question papers (PDF)</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={3}>Upload Paper</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <form onSubmit={handleUpload}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={form.exam_type}
                  label="Exam Type"
                  onChange={e => setForm({ ...form, exam_type: e.target.value })}
                  required
                >
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField fullWidth label="Paper Title" size="small" sx={{ mb: 2 }} required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              
              <TextField fullWidth label="Year" type="number" size="small" sx={{ mb: 2 }} required
                value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />

              <TextField fullWidth label="Description (Optional)" multiline rows={2} size="small" sx={{ mb: 3 }}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 3, py: 1 }}
              >
                {file ? file.name : 'Choose PDF File'}
                <input type="file" hidden accept="application/pdf" 
                  onChange={e => setFile(e.target.files[0])} />
              </Button>

              <Button fullWidth variant="contained" type="submit" sx={{ py: 1.2 }}>
                Upload Now
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Paper Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {papers.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#fee2e2', color: '#dc2626' }}><PictureAsPdfIcon fontSize="small" /></Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{row.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.exam_type_name}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.year} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View PDF">
                          <IconButton component="a" href={row.file} target="_blank" color="primary">
                            <PictureAsPdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(row.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {papers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No papers uploaded yet.</Typography>
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

export default withAdmin(OldPapers);
