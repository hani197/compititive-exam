import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, FormControl, InputLabel,
  Select, MenuItem, TextField, Alert, CircularProgress, Chip, Paper, Avatar, 
  Accordion, AccordionSummary, AccordionDetails, Divider, IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

const difficulties = ['easy', 'medium', 'hard', 'mixed'];

function GeneratePaperPage() {
  const [examTypes, setExamTypes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [students, setStudents] = useState([]);
  const [oldPapers, setOldPapers] = useState([]);
  const [form, setForm] = useState({
    title: '', exam_type_id: '', subject_id: '',
    chapter_ids: [], difficulty: 'mixed',
    total_questions: 10, duration_minutes: 60,
    old_paper_ids: []
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState('panel1');

  useEffect(() => {
    api.get('/exam-types/').then(r => setExamTypes(r.data.results || r.data));
    api.get('/auth/students/').then(r => setStudents(r.data.results || r.data));
    api.get('/papers/old-papers/').then(r => setOldPapers(r.data.results || r.data));
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
      const data = r.data.results || r.data;
      setChapters(data);
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
      setExpanded('panel3'); // Move to assign section
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
      setSuccess('Paper assigned to ' + selectedStudents.length + ' student(s)!');
      setSelectedStudents([]);
    } catch { setError('Assignment failed.'); }
    finally { setAssigning(false); }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <Typography variant="h5" fontWeight={800}>AI Paper Generator</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>Configure, generate and assign custom exam papers in minutes</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ mb: 4 }}>
        {/* Section 1: Basic Configuration */}
        <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')} sx={{ borderRadius: '12px !important', mb: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SettingsIcon color="primary" fontSize="small" />
              <Typography fontWeight={700}>1. Basic Configuration</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
              <TextField
                fullWidth label="Paper Title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. UPSC CSAT - Reasoning Test" size="small"
              />

              <FormControl fullWidth size="small">
                <InputLabel id="exam-type-label">Exam Type</InputLabel>
                <Select
                  labelId="exam-type-label"
                  value={form.exam_type_id}
                  label="Exam Type"
                  onChange={e => setForm({ ...form, exam_type_id: e.target.value })}
                >
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={!form.exam_type_id}>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  value={form.subject_id}
                  label="Subject"
                  onChange={e => setForm({ ...form, subject_id: e.target.value })}
                >
                  {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>

              {form.subject_id && (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
                    Select Chapters:
                  </Typography>
                  {chapters.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {chapters.map(c => (
                        <Chip
                          key={c.id}
                          label={c.name}
                          onClick={() => toggleChapter(c.id)}
                          color={form.chapter_ids.includes(c.id) ? 'primary' : 'default'}
                          variant={form.chapter_ids.includes(c.id) ? 'filled' : 'outlined'}
                          sx={{ cursor: 'pointer', fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Alert severity="warning" variant="outlined">No chapters found for this subject.</Alert>
                  )}
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={form.difficulty} label="Difficulty" onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {difficulties.map(d => <MenuItem key={d} value={d}>{d.toUpperCase()}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth label="Questions" type="number" size="small"
                  value={form.total_questions}
                  onChange={e => setForm({ ...form, total_questions: +e.target.value })}
                  InputProps={{ startAdornment: <QuizIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} /> }}
                />
                <TextField
                  fullWidth label="Minutes" type="number" size="small"
                  value={form.duration_minutes}
                  onChange={e => setForm({ ...form, duration_minutes: +e.target.value })}
                  InputProps={{ startAdornment: <TimerIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} /> }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Section 2: AI Source Context */}
        <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')} sx={{ borderRadius: '12px !important', mb: 1.5, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HistoryIcon color="primary" fontSize="small" />
              <Typography fontWeight={700}>2. AI Source Context (Optional)</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="old-papers-label">Pick Questions from Previous Papers</InputLabel>
              <Select
                labelId="old-papers-label"
                multiple
                value={form.old_paper_ids}
                onChange={e => setForm({ ...form, old_paper_ids: e.target.value })}
                label="Pick Questions from Previous Papers"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => (
                      <Chip key={id} label={oldPapers.find(p => p.id === id)?.title} size="small" />
                    ))}
                  </Box>
                )}
              >
                {oldPapers.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.title} ({p.year})</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                If selected, the AI will prioritize extracting or adapting questions from these PDFs.
              </Typography>
            </FormControl>

            <Button
              variant="contained" size="large" fullWidth
              onClick={handleGenerate} disabled={loading || !!generatedPaper}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon />}
              sx={{ mt: 4, py: 1.5, fontWeight: 800, borderRadius: 2, bgcolor: '#4338ca' }}
            >
              {loading ? 'AI is Generating Questions...' : generatedPaper ? 'Paper Generated ✓' : 'Start AI Generation'}
            </Button>
          </AccordionDetails>
        </Accordion>

        {/* Section 3: Student Assignment */}
        <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')} disabled={!generatedPaper} sx={{ borderRadius: '12px !important', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GroupAddIcon color="primary" fontSize="small" />
              <Typography fontWeight={700}>3. Assign to Students</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {generatedPaper && (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <strong>{generatedPaper.title}</strong> created successfully with {generatedPaper.questions?.length} questions.
                </Alert>
                
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>Select Students:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                  {students.filter(s => s.role === 'student').map(s => {
                    const selected = selectedStudents.find(x => x.id === s.id);
                    return (
                      <Chip
                        key={s.id}
                        avatar={<Avatar sx={{ bgcolor: selected ? '#fff' : '#4338ca', color: selected ? '#4338ca' : '#fff', fontSize: 11 }}>{(s.first_name?.[0] || s.username?.[0] || '?').toUpperCase()}</Avatar>}
                        label={`${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username}
                        onClick={() => toggleStudent(s)}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                      />
                    );
                  })}
                </Box>

                <Button
                  variant="contained" color="success" size="large" fullWidth
                  onClick={handleAssign} disabled={assigning || selectedStudents.length === 0}
                  startIcon={assigning ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SendIcon />}
                  sx={{ py: 1.5, fontWeight: 800, borderRadius: 2 }}
                >
                  {assigning ? 'Assigning...' : `Assign to ${selectedStudents.length} Selected Student(s)`}
                </Button>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}

export default withAdmin(GeneratePaperPage);
