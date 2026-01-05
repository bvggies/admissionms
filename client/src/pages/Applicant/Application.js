import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const Application = () => {
  const [programmes, setProgrammes] = useState([]);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    programmeId: '',
    campus: '',
    qualifications: [
      {
        qualificationType: 'WASSCE',
        institutionName: '',
        yearCompleted: '',
        overallGrade: '',
        subjects: {},
      },
    ],
  });

  useEffect(() => {
    fetchProgrammes();
    checkExistingApplication();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const response = await axios.get('/admin/programmes');
      if (response.data.success) {
        setProgrammes(response.data.programmes.filter((p) => p.is_active));
      }
    } catch (error) {
      console.error('Error fetching programmes:', error);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const response = await axios.get('/applications/my-application');
      if (response.data.success && response.data.application) {
        setExistingApplication(response.data.application);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQualificationChange = (index, field, value) => {
    const updated = [...formData.qualifications];
    updated[index][field] = value;
    setFormData({ ...formData, qualifications: updated });
  };

  const handleSubjectChange = (qualIndex, subject, grade) => {
    const updated = [...formData.qualifications];
    updated[qualIndex].subjects[subject] = grade;
    setFormData({ ...formData, qualifications: updated });
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [
        ...formData.qualifications,
        {
          qualificationType: 'WASSCE',
          institutionName: '',
          yearCompleted: '',
          overallGrade: '',
          subjects: {},
        },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    if (!formData.programmeId || !formData.campus) {
      setMessage('Please select a programme and campus');
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post('/applications/submit', formData);
      if (response.data.success) {
        setMessage('Application submitted successfully!');
        checkExistingApplication();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
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

  if (existingApplication) {
    return (
      <Container>
        <Alert severity="info" sx={{ mb: 2 }}>
          You already have an application submitted. Application ID: {existingApplication.application_id}
        </Alert>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Application Details
          </Typography>
          <Typography variant="body2">
            <strong>Status:</strong> {existingApplication.status.replace('_', ' ').toUpperCase()}
          </Typography>
          <Typography variant="body2">
            <strong>Programme:</strong> {existingApplication.programme_name}
          </Typography>
          <Typography variant="body2">
            <strong>Campus:</strong> {existingApplication.campus}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Submit Application
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Programme Selection
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Programme"
                name="programmeId"
                value={formData.programmeId}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Programme</MenuItem>
                {programmes.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.name} - {prog.campus}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select Campus</MenuItem>
                <MenuItem value="Akuapem Campus">Akuapem Campus</MenuItem>
                <MenuItem value="Agogo Campus">Agogo Campus</MenuItem>
                <MenuItem value="Asante Akyem Campus">Asante Akyem Campus</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom>
            Academic Qualifications
          </Typography>

          {formData.qualifications.map((qual, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom>
                Qualification {index + 1}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Qualification Type"
                    value={qual.qualificationType}
                    onChange={(e) =>
                      handleQualificationChange(index, 'qualificationType', e.target.value)
                    }
                    SelectProps={{ native: true }}
                  >
                    <option value="WASSCE">WASSCE</option>
                    <option value="SSSCE">SSSCE</option>
                    <option value="GCE">GCE</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Institution Name"
                    value={qual.institutionName}
                    onChange={(e) =>
                      handleQualificationChange(index, 'institutionName', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Year Completed"
                    type="number"
                    value={qual.yearCompleted}
                    onChange={(e) =>
                      handleQualificationChange(index, 'yearCompleted', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Overall Grade"
                    value={qual.overallGrade}
                    onChange={(e) =>
                      handleQualificationChange(index, 'overallGrade', e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Subject Grades
                  </Typography>
                  <Grid container spacing={2}>
                    {['English', 'Mathematics', 'Science', 'Social Studies'].map((subject) => (
                      <Grid item xs={6} sm={3} key={subject}>
                        <TextField
                          fullWidth
                          label={subject}
                          size="small"
                          value={qual.subjects[subject] || ''}
                          onChange={(e) =>
                            handleSubjectChange(index, subject, e.target.value)
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Button variant="outlined" onClick={addQualification} sx={{ mb: 2 }}>
            Add Another Qualification
          </Button>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              size="large"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Application;

