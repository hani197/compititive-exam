import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, LinearProgress, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { withAuth } from '../components/withAuth';
import api from '../lib/api';

function ExamSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    api.get('sessions/' + sessionId + '/').then(res => {
      setSession(res.data);
      const qCount = res.data.paper_detail?.questions?.length || 0;
      setQuestions(res.data.paper_detail?.questions || []);
      // 60 seconds per question
      setTimeLeft(qCount * 60);
    });
  }, [sessionId]);

  const handleSubmit = useCallback(async () => {
    if (!sessionId) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.entries(answers).map(([qid, val]) => ({
      question_id: parseInt(qid),
      selected_option: val.length === 1 ? val : '',
      answer_text: val.length > 1 ? val : '',
    }));
    try {
      await api.post('sessions/' + sessionId + '/submit/', {
        answers: answersArray,
        time_taken_seconds: timeTaken,
      });
      navigate('/result/' + sessionId);
    } catch (err) {

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, answers, startTime, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setTimeLeft(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, handleSubmit]);

  if (!session) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  const question = questions[currentIndex];
  const attempted = Object.keys(answers).length;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{session.paper_detail?.title}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={attempted + '/' + questions.length + ' Answered'} color="primary" />
          <Chip label={timeLeft !== null ? fmt(timeLeft) : '...'} color={timeLeft < 300 ? 'error' : 'default'} />
        </Box>
      </Box>

      <LinearProgress variant="determinate" value={(currentIndex + 1) / questions.length * 100} sx={{ mb: 3 }} />

      {question && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Question {question.question_number} of {questions.length} | {question.marks} mark(s)
            </Typography>
            <Typography variant="h6" mb={3}>{question.question_text}</Typography>
            {question.question_type === 'mcq' && (
              <FormControl component="fieldset">
                <RadioGroup value={answers[question.id] || ''}
                  onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })}>
                  {['A', 'B', 'C', 'D'].map(opt =>
                    question['option_' + opt.toLowerCase()] ? (
                      <FormControlLabel key={opt} value={opt} control={<Radio />}
                        label={opt + '. ' + question['option_' + opt.toLowerCase()]} />
                    ) : null
                  )}
                </RadioGroup>
              </FormControl>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>Previous</Button>
        {currentIndex < questions.length - 1
          ? <Button variant="contained" onClick={() => setCurrentIndex(i => i + 1)}>Next</Button>
          : <Button variant="contained" color="success" onClick={() => setConfirmOpen(true)}>Submit Exam</Button>
        }
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {questions.map((q, i) => (
          <Button key={q.id} size="small"
            variant={i === currentIndex ? 'contained' : 'outlined'}
            color={answers[q.id] ? 'success' : 'inherit'}
            onClick={() => setCurrentIndex(i)}
            sx={{ minWidth: 40 }}>
            {i + 1}
          </Button>
        ))}
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>Answered: {attempted} | Unattempted: {questions.length - attempted}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAuth(ExamSession);
