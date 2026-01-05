import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import axios from 'axios';

const AdminProgrammes = () => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    campus: '',
    durationYears: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const response = await axios.get('/admin/programmes');
      if (response.data.success) {
        setProgrammes(response.data.programmes);
      }
    } catch (error) {
      console.error('Error fetching programmes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (programme = null) => {
    if (programme) {
      setEditing(programme);
      setFormData({
        code: programme.code,
        name: programme.name,
        campus: programme.campus || '',
        durationYears: programme.duration_years || '',
        description: programme.description || '',
        isActive: programme.is_active,
      });
    } else {
      setEditing(null);
      setFormData({
        code: '',
        name: '',
        campus: '',
        durationYears: '',
        description: '',
        isActive: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(`/admin/programmes/${editing.id}`, formData);
      } else {
        await axios.post('/admin/programmes', formData);
      }
      fetchProgrammes();
      handleClose();
    } catch (error) {
      console.error('Error saving programme:', error);
      alert(error.response?.data?.message || 'Failed to save programme');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Programmes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Programme
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Campus</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programmes.map((prog) => (
              <TableRow key={prog.id}>
                <TableCell>{prog.code}</TableCell>
                <TableCell>{prog.name}</TableCell>
                <TableCell>{prog.campus || 'N/A'}</TableCell>
                <TableCell>{prog.duration_years ? `${prog.duration_years} years` : 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={prog.is_active ? 'Active' : 'Inactive'}
                    color={prog.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(prog)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Programme' : 'Add Programme'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            margin="normal"
            required
            disabled={!!editing}
          />
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Campus"
            value={formData.campus}
            onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Duration (Years)"
            type="number"
            value={formData.durationYears}
            onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProgrammes;

