import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, FormControl, InputLabel,
  Select, MenuItem, Checkbox, FormControlLabel, TextField,
  Alert, CircularProgress, Chip, Paper, Grid, Avatar, Stepper, Step, StepLabel
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import { withAdmin } from '@/components/withAuth';
import api from '@/lib/axios';

const difficulties = ['easy', 'medium', 'hard', 'mixed'];

function GeneratePaperPage() {
  const [examTypes, setExamTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    title: '', exam_type_id: '', subject_id: '',
    chapter_ids: [], difficulty: 'mixed',
    total_questions: 30, duration_minutes: 60
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/exam-types/').then(r => setExamTypes(r.data.results || r.data));
    api.get('/auth/students/').then(r => setStudents(r.data.results || r.data));
  }, []);

  useEffect(() => {
    if (!form.exam_type_id) return;
    api.get('/subjects/?exam_type=' + form.exam_type_id).then(r => {
      setSubjects(r.data.results || r.data);
      setForm(f => ({ ...f, subject_id: '', chapter_ids: [] }));
      setChapters([]);
    });
  }, [form.exam_type_id]);

  useEffect(() => {
    if (!form.subject_id) return;
    api.get('/chapters/?subject=' + form.subject_id).then(r => {
      setChapters(r.data.results || r.data);
      setForm(f => ({ ...f, chapter_ids: [] }));
    });
  }, [form.subject_id]);

  const toggleChapter = id => setForm(f => ({
    ...f,
    chapter_ids: f.chapter_ids.includes(id) ? f.chapter_ids.filter(c => c !== id) : [...f.chapter_ids, id]
  }));

  const toggleStudent = s => setSelectedStudents(prev =>
    prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
  );

  const handleGenerate = async () => {
    if (!form.exam_type_id || !form.subject_id || form.chapter_ids.length === 0) {
      setError('Select exam type, subject and at least one chapter.');
      return;
    }
    setLoading(true); setError(''); setGeneratedPaper(null); setSuccess('');
    try {
      const res = await api.post('/papers/generate/', form);
      setGeneratedPaper(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI generation failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!generatedPaper) return;
    if (selectedStudents.length === 0) { setError('Select at least one student.'); return; }
    setAssigning(true); setError('');
    try {
      await api.post('/papers/' + generatedPaper.id + '/assign/', {
        student_ids: selectedStudents.map(s => s.id),
      });
      setSuccess('Paper assigned to ' + selectedStudents.length + ' user(s)!');
      setSelectedStudents([]);
    } catch { setError('Assignment failed.'); }
    finally { setAssigning(false); }
  };

  const activeStep = generatedPaper ? 1 : 0;

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Generate & Assign AI Paper</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Use AI to create customised question papers and assign to students
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step completed={!!generatedPaper}>
          <StepLabel>Configure & Generate</StepLabel>
        </Step>
        <Step>
          <StepLabel>Assign to Students</StepLabel>
        </Step>
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Step 1 */}
      <Card sx={{ mb: 3, opacity: generatedPaper ? 0.7 : 1 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ bgcolor: '#ede9fe', borderRadius: 2, p: 1, display: 'flex' }}>
              <AutoAwesomeIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Step 1: Configure Paper</Typography>
          </Box>

          <TextField
            fullWidth label="Paper Title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. EAMCET Maths - Chapter Test" sx={{ mb: 2 }}
          />

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select value={form.exam_type_id} label="Exam Type"
                  onChange={e => setForm({ ...form, exam_type_id: e.target.value })}>
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!form.exam_type_id}>
                <InputLabel>Subject</InputLabel>
                <Select value={form.subject_id} label="Subject"
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                  {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {chapters.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.secondary">
                Select Chapters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {chapters.map(c => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    onClick={() => toggleChapter(c.id)}
                    color={form.chapter_ids.includes(c.id) ? 'primary' : 'default'}
                    variant={form.chapter_ids.includes(c.id) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select value={form.difficulty} label="Difficulty"
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  {difficulties.map(d => (
                    <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Number of Questions" type="number"
                value={form.total_questions}
                onChange={e => setForm({ ...form, total_questions: +e.target.value })}
                inputProps={{ min: 5, max: 100 }}
                InputProps={{ startAdornment: <QuizIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Duration (minutes)" type="number"
                value={form.duration_minutes}
                onChange={e => setForm({ ...form, duration_minutes: +e.target.value })}
                inputProps={{ min: 10, max: 300 }}
                InputProps={{ startAdornment: <TimerIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} /> }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained" size="large"
            onClick={handleGenerate} disabled={loading || !!generatedPaper}
            startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
            sx={{ px: 4 }}
          >
            {loading ? 'Generating with AI...' : generatedPaper ? 'Paper Generated ✓' : 'Generate Paper'}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2 */}
      {generatedPaper && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ bgcolor: '#d1fae5', borderRadius: 2, p: 1, display: 'flex' }}>
                <SendIcon sx={{ color: '#10b981', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={700}>Step 2: Assign to Students</Typography>
            </Box>

            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
              <strong>"{generatedPaper.title}"</strong> generated with {generatedPaper.questions?.length} questions.
            </Alert>

            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              Select Students / Instructors:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {students.filter(s => s.role !== 'admin').map(s => {
                const selected = selectedStudents.find(x => x.id === s.id);
                return (
                  <Chip
                    key={s.id}
                    avatar={
                      <Avatar sx={{ bgcolor: selected ? '#fff' : '#ede9fe', color: selected ? '#4f46e5' : '#4f46e5', fontSize: 11, fontWeight: 700 }}>
                        {(s.first_name?.[0] || s.username?.[0] || '?').toUpperCase()}
                      </Avatar>
                    }
                    label={`${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username}
                    onClick={() => toggleStudent(s)}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                );
              })}
              {students.length === 0 && (
                <Typography color="text.secondary" variant="body2">No users registered yet.</Typography>
              )}
            </Box>

            {selectedStudents.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {selectedStudents.length} selected: {selectedStudents.map(s => s.first_name || s.username).join(', ')}
              </Alert>
            )}

            <Button
              variant="contained" color="success" size="large"
              onClick={handleAssign} disabled={assigning || selectedStudents.length === 0}
              startIcon={assigning ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon />}
              sx={{ px: 4 }}
            >
              {assigning ? 'Assigning...' : 'Assign Paper'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default withAdmin(GeneratePaperPage);
