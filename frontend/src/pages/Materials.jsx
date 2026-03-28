import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button,
  CircularProgress, Chip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import NotesIcon from '@mui/icons-material/Notes';
import { withAuth } from '../components/withAuth';
import api from '../lib/api';

const typeIcon = {
  pdf: <PictureAsPdfIcon />,
  video: <VideoLibraryIcon />,
  notes: <NotesIcon />,
  practice: <NotesIcon />,
};

function Materials() {
  const navigate = useNavigate();
  const { examTypeId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examTypeId) return;
    api.get('subjects/?exam_type=' + examTypeId).then(res => {
      setSubjects(res.data.results || res.data);
    });
  }, [examTypeId]);

  useEffect(() => {
    if (!examTypeId) return;
    const params = new URLSearchParams({ exam_type: examTypeId });
    if (selectedSubject) params.append('subject', selectedSubject);
    api.get('materials/?' + params).then(res => {
      setMaterials(res.data.results || res.data);
    }).finally(() => setLoading(false));
  }, [examTypeId, selectedSubject]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>Study Materials</Typography>

      <FormControl sx={{ mb: 3, minWidth: 250 }}>
        <InputLabel>Filter by Subject</InputLabel>
        <Select value={selectedSubject} label="Filter by Subject"
          onChange={e => setSelectedSubject(e.target.value)}>
          <MenuItem value="">All Subjects</MenuItem>
          {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </Select>
      </FormControl>

      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {materials.map(m => (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {typeIcon[m.material_type]}
                    <Chip label={m.material_type.toUpperCase()} size="small" />
                  </Box>
                  <Typography variant="h6">{m.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{m.description}</Typography>
                </CardContent>
                <CardActions>
                  {m.file && (
                    <Button size="small" href={'http://localhost:8000' + m.file} target="_blank">
                      Download
                    </Button>
                  )}
                  {m.video_url && (
                    <Button size="small" href={m.video_url} target="_blank">Watch Video</Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
          {materials.length === 0 && (
            <Grid item xs={12}>
              <Typography>No materials available yet.</Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

export default withAuth(Materials);
