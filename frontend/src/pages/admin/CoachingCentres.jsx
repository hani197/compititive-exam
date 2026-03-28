import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import api from '../../lib/api';
import { withAdmin } from '../../components/withAuth';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CoachingCentres = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_person: '',
    contact_person_phone: '',
    status: 'active',
    director: null,
  });

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const response = await api.get('coaching/centres/');
      setCentres(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch coaching centres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCentre(null);
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contact_person: '',
      contact_person_phone: '',
      status: 'active',
      director: null,
    });
    setOpenDialog(true);
  };

  const handleEditClick = (centre) => {
    setEditingCentre(centre);
    setFormData(centre);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCentre(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.code || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingCentre) {
        await api.put(`coaching/centres/${editingCentre.id}/`, formData);
        setSuccess('Coaching centre updated successfully');
      } else {
        await api.post('coaching/centres/', formData);
        setSuccess('Coaching centre created successfully');
      }

      handleCloseDialog();
      fetchCentres();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save coaching centre');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coaching centre?')) {
      try {
        await api.delete(`coaching/centres/${id}/`);
        setSuccess('Coaching centre deleted successfully');
        fetchCentres();
      } catch (err) {
        setError('Failed to delete coaching centre');
      }
    }
  };

  if (loading && centres.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <h1>Coaching Centres Management</h1>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Centre
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {centres.length === 0 ? (
            <Alert severity="info">No coaching centres found. Create one to get started.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Code</strong></TableCell>
                    <TableCell><strong>City</strong></TableCell>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {centres.map((centre) => (
                    <TableRow key={centre.id}>
                      <TableCell>{centre.name}</TableCell>
                      <TableCell>{centre.code}</TableCell>
                      <TableCell>{centre.city}</TableCell>
                      <TableCell>{centre.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={centre.status}
                          color={centre.status === 'active' ? 'success' : centre.status === 'inactive' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditClick(centre)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(centre.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCentre ? 'Edit Coaching Centre' : 'Add New Coaching Centre'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Centre Name*"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Code*"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Email*"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Contact Person"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Contact Person Phone"
              name="contact_person_phone"
              value={formData.contact_person_phone}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingCentre ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default withAdmin(CoachingCentres);
