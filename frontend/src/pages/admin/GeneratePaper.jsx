import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, FormControl, InputLabel,
  Select, MenuItem, TextField, Alert, CircularProgress, Chip, Paper, Avatar, 
  Accordion, AccordionSummary, AccordionDetails, Divider, IconButton, Stack,
  ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import { withAdmin } from '../../components/withAuth';
import api from '../../lib/api';

const difficulties = ['easy', 'medium', 'hard', 'mixed'];

function GeneratePaperPage() {
  const [examTypes, setExamTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [oldPapers, setOldPapers] = useState([]);
  const [examData, setExamData] = useState([]); // Hierarchy: [ { subject, chapters: [] } ]
  
  const [form, setForm] = useState({
    title: '', exam_type_id: '',
    chapter_ids: [], difficulty: 'mixed',
    total_questions: 10, duration_minutes: 60,
    mode: 'ai_generated',
    old_paper_ids: []
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingExamData, setFetchingExamData] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState('panel1');

  useEffect(() => {
    api.get('exam-types/').then(r => setExamTypes(r.data.results || r.data || []));
    api.get('auth/students/').then(r => setStudents(r.data.results || r.data || []));
    api.get('papers/old-papers/').then(r => setOldPapers(r.data.results || r.data || []));
  }, []);

  // Fetch Subject->Chapter hierarchy when Exam Type changes
  useEffect(() => {
    if (!form.exam_type_id) {
      setExamData([]);
      return;
    }
    
    const loadHierarchy = async () => {
      setFetchingExamData(true);
      try {
        const [subRes, chapRes] = await Promise.all([
          api.get('subjects/?exam_type=' + form.exam_type_id),
          api.get('chapters/?exam_type=' + form.exam_type_id)
        ]);
        const subs = subRes.data.results || subRes.data || [];
        const allChaps = chapRes.data.results || chapRes.data || [];
        
        setExamData(subs.map(s => ({
          ...s,
          chapters: allChaps.filter(c => c.subject === s.id)
        })));
      } catch (err) {
        console.error("Failed to load syllabus hierarchy", err);
      } finally {
        setFetchingExamData(false);
      }
    };
    loadHierarchy();
  }, [form.exam_type_id]);

  const toggleChapter = id => setForm(f => ({
    ...f,
    chapter_ids: f.chapter_ids.includes(id) ? f.chapter_ids.filter(c => c !== id) : [...f.chapter_ids, id]
  }));

  const selectAllInSubject = (subjectChapters) => {
    const ids = subjectChapters.map(c => c.id);
    if (ids.length === 0) return;
    
    const allSelected = ids.every(id => form.chapter_ids.includes(id));
    setForm(f => ({
      ...f,
      chapter_ids: allSelected 
        ? f.chapter_ids.filter(id => !ids.includes(id)) 
        : Array.from(new Set([...f.chapter_ids, ...ids]))
    }));
  };

  const toggleStudent = s => setSelectedStudents(prev =>
    prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
  );

  const handleGenerate = async () => {
    if (!form.exam_type_id || form.chapter_ids.length === 0) {
      setError('Select exam type and at least one chapter.');
      return;
    }
    if (form.mode === 'from_pdf' && form.old_paper_ids.length === 0) {
      setError('Please select at least one uploaded PDF to extract questions from.');
      return;
    }
    setLoading(true); setError(''); setGeneratedPaper(null); setSuccess('');
    try {
      // Backend now expects subject_id='all' if multiple subjects covered
      const submission = { ...form, subject_id: 'all' };
      const res = await api.post('papers/generate/', submission);
      setGeneratedPaper(res.data);
      setExpanded('panel3');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'AI generation failed.';
      const detailMsg = err.response?.data?.details ? `\n\nDetails: ${err.response.data.details}` : '';
      setError(errorMsg + detailMsg);
    } finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!generatedPaper) return;
    if (selectedStudents.length === 0) { setError('Select at least one student.'); return; }
    setAssigning(true); setError('');
    try {
      await api.post('papers/' + generatedPaper.id + '/assign/', {
        student_ids: selectedStudents.map(s => s.id),
      });
      setSuccess('Paper assigned successfully!');
      setSelectedStudents([]);
    } catch { setError('Assignment failed.'); }
    finally { setAssigning(false); }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 3, p: 3, mb: 4, color: '#fff'
      }}>
        <Typography variant="h5" fontWeight={800}>AI Paper Generator</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>Generate and assign papers to your students</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={{ mb: 4 }}>
        {/* Step 1: Syllabus & Config */}
        <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')} sx={{ borderRadius: '12px !important', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SettingsIcon color="primary" fontSize="small" />
              <Typography fontWeight={700}>1. Syllabus & Basic Configuration</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField fullWidth label="Paper Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. CEEP Mathematics Final" size="small" />
              
              <FormControl fullWidth size="small">
                <InputLabel>Exam Type</InputLabel>
                <Select value={form.exam_type_id} label="Exam Type" onChange={e => setForm({ ...form, exam_type_id: e.target.value, chapter_ids: [] })}>
                  {examTypes.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>

              {fetchingExamData && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}><CircularProgress size={16} /> <Typography variant="caption">Loading Subjects & Chapters...</Typography></Box>}

              {form.exam_type_id && !fetchingExamData && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">Select Subjects & Chapters:</Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, width: '25%', bgcolor: '#f8fafc' }}>Subject</TableCell>
                          <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc' }}>Chapters</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {examData.map((subject) => {
                          const subChapterIds = subject.chapters.map(c => c.id);
                          const allSelected = subChapterIds.length > 0 && subChapterIds.every(id => form.chapter_ids.includes(id));
                          
                          return (
                            <TableRow key={subject.id} hover>
                              <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                                <Typography variant="body2" fontWeight={700} gutterBottom>{subject.name}</Typography>
                                <Button 
                                  size="small" 
                                  variant={allSelected ? "contained" : "outlined"} 
                                  color={allSelected ? "success" : "primary"}
                                  onClick={() => selectAllInSubject(subject.chapters)}
                                  disabled={subject.chapters.length === 0}
                                  sx={{ fontSize: '0.6rem', py: 0, minWidth: 80 }}
                                >
                                  {allSelected ? "All Selected" : "Select All"}
                                </Button>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                  {subject.chapters.map(c => (
                                    <Chip
                                      key={c.id}
                                      label={c.name}
                                      size="small"
                                      onClick={() => toggleChapter(c.id)}
                                      color={form.chapter_ids.includes(c.id) ? "primary" : "default"}
                                      variant={form.chapter_ids.includes(c.id) ? "filled" : "outlined"}
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                  {subject.chapters.length === 0 && <Typography variant="caption" color="text.secondary">No chapters found.</Typography>}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                    {form.chapter_ids.length} chapter(s) selected for paper generation.
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={form.difficulty} label="Difficulty" onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {difficulties.map(d => <MenuItem key={d} value={d}>{d.toUpperCase()}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Questions" type="number" size="small" value={form.total_questions} onChange={e => setForm({ ...form, total_questions: +e.target.value })} />
                <TextField fullWidth label="Minutes" type="number" size="small" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: +e.target.value })} />
              </Box>

              <Divider sx={{ my: 1 }}><Chip label="Generation Mode" size="small" /></Divider>

              <ToggleButtonGroup
                color="primary"
                value={form.mode}
                exclusive
                onChange={(e, next) => {
                  if (next) {
                    setForm({ ...form, mode: next });
                    if (next === 'from_pdf') setExpanded('panel2');
                  }
                }}
                fullWidth
                size="small"
              >
                <ToggleButton value="ai_generated" sx={{ gap: 1, py: 1.5 }}>
                  <AutoAwesomeIcon fontSize="small" /> AI Generated
                </ToggleButton>
                <ToggleButton value="from_pdf" sx={{ gap: 1, py: 1.5 }}>
                  <PictureAsPdfIcon fontSize="small" /> From Uploaded PDFs
                </ToggleButton>
              </ToggleButtonGroup>

              {form.mode === 'ai_generated' && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleGenerate} 
                  disabled={loading || !!generatedPaper || !form.exam_type_id || form.chapter_ids.length === 0} 
                  startIcon={loading ? <CircularProgress size={18} /> : <AutoAwesomeIcon />} 
                  sx={{ 
                    py: 1.5, 
                    fontWeight: 800, 
                    mt: 1,
                    boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                    background: 'linear-gradient(45deg, #1e1b4b 30%, #4338ca 90%)'
                  }}
                >
                  {loading ? 'AI Generating...' : generatedPaper ? 'Generated ✓' : 'Start AI Generation'}
                </Button>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Step 2: Source Selection */}
        <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')} sx={{ borderRadius: '12px !important', mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {form.mode === 'from_pdf' ? <PictureAsPdfIcon color="primary" fontSize="small" /> : <HistoryIcon color="primary" fontSize="small" />}
              <Typography fontWeight={700}>
                {form.mode === 'from_pdf' ? '2. PDF Source Selection (Required)' : '2. Source Context (Optional)'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth size="small" required={form.mode === 'from_pdf'}>
                <InputLabel>{form.mode === 'from_pdf' ? 'Extract Questions from Old Papers' : 'Inspiration from Old Papers'}</InputLabel>
                <Select multiple value={form.old_paper_ids} onChange={e => setForm({ ...form, old_paper_ids: e.target.value })} label={form.mode === 'from_pdf' ? 'Extract Questions from Old Papers' : 'Inspiration from Old Papers'}
                  renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map(id => <Chip key={id} label={oldPapers.find(p => p.id === id)?.title} size="small" />)}</Box>}
                >
                  {oldPapers.map(p => <MenuItem key={p.id} value={p.id}>{p.title} ({p.year})</MenuItem>)}
                </Select>
              </FormControl>
              {form.mode === 'from_pdf' && form.old_paper_ids.length === 0 && (
                <Alert severity="info" size="small">Select one or more PDFs from the list above to extract questions.</Alert>
              )}
              <Button variant="contained" fullWidth onClick={handleGenerate} disabled={loading || !!generatedPaper} startIcon={loading ? <CircularProgress size={18} /> : (form.mode === 'from_pdf' ? <PictureAsPdfIcon /> : <AutoAwesomeIcon />)} sx={{ py: 1.5, fontWeight: 800 }}>
                {loading ? (form.mode === 'from_pdf' ? 'Extracting...' : 'AI Generating...') : generatedPaper ? 'Generated ✓' : (form.mode === 'from_pdf' ? 'Extract Questions from PDF' : 'Start AI Generation')}
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Step 3: Assignment */}
        <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')} disabled={!generatedPaper} sx={{ borderRadius: '12px !important' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GroupAddIcon color="primary" fontSize="small" />
              <Typography fontWeight={700}>3. Student Assignment</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {generatedPaper && (
              <Stack spacing={3}>
                <Typography variant="subtitle2" fontWeight={700}>Select Students:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {students.filter(s => s.role === 'student').map(s => {
                    const selected = selectedStudents.find(x => x.id === s.id);
                    return <Chip key={s.id} label={s.username} onClick={() => toggleStudent(s)} color={selected ? 'primary' : 'default'} variant={selected ? 'filled' : 'outlined'} sx={{ cursor: 'pointer' }} />;
                  })}
                </Box>
                <Button variant="contained" color="success" fullWidth onClick={handleAssign} disabled={assigning || selectedStudents.length === 0} startIcon={assigning ? <CircularProgress size={18} /> : <SendIcon />} sx={{ py: 1.5, fontWeight: 800 }}>
                  {assigning ? 'Assigning...' : 'Assign to Selected'}
                </Button>
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}

export default withAdmin(GeneratePaperPage);
