import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box, Typography, Card, CardContent, Button, FormControl,
  InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  CircularProgress, Alert, Slider
} from '@mui/material';
import { withAuth } from '@/components/withAuth';
import api from '@/lib/axios';

function PracticePage() {
  const router = useRouter();
  const { examTypeId } = router.query;
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(30);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examTypeId) return;
    api.get('/subjects/?exam_type=' + examTypeId).then(res => {
      setSubjects(res.data.results || res.data);
    });
  }, [examTypeId]);

  useEffect(() => {
    if (!selectedSubject) return;
    api.get('/chapters/?subject=' + selectedSubject).then(res => {
      setChapters(res.data.results || res.data);
      setSelectedChapters([]);
    });
  }, [selectedSubject]);

  const toggleChapter = (id) => {
    setSelectedChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (!selectedSubject || selectedChapters.length === 0) {
      setError('Please select a subject and at least one chapter.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const paperRes = await api.post('/papers/generate/', {
        exam_type_id: parseInt(examTypeId),
        subject_id: parseInt(selectedSubject),
        chapter_ids: selectedChapters,
        total_questions: questionCount,
        difficulty,
        duration_minutes: duration,
      });
      const sessionRes = await api.post('/sessions/', { paper_id: paperRes.data.id });
      router.push('/exam/' + sessionRes.data.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate paper. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" mb={3}>Generate Practice Paper</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Subject</InputLabel>
            <Select value={selectedSubject} label="Select Subject" onChange={e => setSelectedSubject(e.target.value)}>
              {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>

          {chapters.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle1" mb={1}>Select Chapters:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {chapters.map(c => (
                  <FormControlLabel key={c.id}
                    control={<Checkbox checked={selectedChapters.includes(c.id)} onChange={() => toggleChapter(c.id)} />}
                    label={c.name}
                  />
                ))}
              </Box>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select value={difficulty} label="Difficulty" onChange={e => setDifficulty(e.target.value)}>
              {['easy', 'medium', 'hard', 'mixed'].map(d => (
                <MenuItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mb={2}>
            <Typography gutterBottom>Number of Questions: {questionCount}</Typography>
            <Slider value={questionCount} onChange={(_, v) => setQuestionCount(v)} min={10} max={100} step={5} />
          </Box>
          <Box>
            <Typography gutterBottom>Duration: {duration} minutes</Typography>
            <Slider value={duration} onChange={(_, v) => setDuration(v)} min={15} max={180} step={15} />
          </Box>
        </CardContent>
      </Card>

      <Button variant="contained" size="large" fullWidth onClick={handleGenerate} disabled={loading}>
        {loading ? <><CircularProgress size={20} sx={{ mr: 1 }} />Generating Paper with AI...</> : 'Generate & Start Exam'}
      </Button>
    </Box>
  );
}

export default withAuth(PracticePage);
