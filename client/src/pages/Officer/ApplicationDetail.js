import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import axios from 'axios';

const OfficerApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: '',
  });

  const fetchApplication = useCallback(async () => {
    try {
      const response = await axios.get(`/applications/${id}`);
      if (response.data.success) {
        setApplication(response.data.application);
        setStatusForm({
          status: response.data.application.status,
          notes: response.data.application.officer_notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setMessage('');
    try {
      const response = await axios.post(`/evaluation/${id}/evaluate`);
      if (response.data.success) {
        setMessage('Application evaluated successfully');
        fetchApplication();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to evaluate');
    } finally {
      setEvaluating(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    setMessage('');
    try {
      const response = await axios.put(`/applications/${id}/status`, statusForm);
      if (response.data.success) {
        setMessage('Status updated successfully');
        fetchApplication();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
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

  if (!application) {
    return (
      <Container>
        <Alert severity="error">Application not found</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Application Details</Typography>
        <Button variant="outlined" onClick={() => navigate('/officer/applications')}>
          Back to List
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Applicant Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {application.first_name} {application.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{application.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{application.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1">
                  {application.date_of_birth
                    ? new Date(application.date_of_birth).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Application ID
                </Typography>
                <Typography variant="body1">{application.application_id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Programme
                </Typography>
                <Typography variant="body1">{application.programme_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Campus
                </Typography>
                <Typography variant="body1">{application.campus}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={application.status.replace('_', ' ').toUpperCase()}
                  color={
                    application.status === 'admitted'
                      ? 'success'
                      : application.status === 'rejected'
                      ? 'error'
                      : 'info'
                  }
                />
              </Grid>
              {application.ai_score && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      AI Score
                    </Typography>
                    <Typography variant="body1">{application.ai_score}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      AI Recommendation
                    </Typography>
                    <Typography variant="body1">
                      {application.ai_recommendation?.toUpperCase() || 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>

            {application.ai_explanation && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Evaluation
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.ai_explanation}
                  </Typography>
                </Paper>
              </Box>
            )}

            {application.qualifications && application.qualifications.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Academic Qualifications
                </Typography>
                {application.qualifications.map((qual, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle1">
                      {qual.qualification_type} - {qual.institution_name} ({qual.year_completed})
                    </Typography>
                    <Typography variant="body2">Overall Grade: {qual.overall_grade}</Typography>
                    {qual.subjects && typeof qual.subjects === 'object' && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Subjects: {Object.entries(qual.subjects).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!application.ai_score && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleEvaluate}
                disabled={evaluating}
                sx={{ mb: 2 }}
              >
                {evaluating ? 'Evaluating...' : 'Run AI Evaluation'}
              </Button>
            )}

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Update Status
            </Typography>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="admitted">Admitted</MenuItem>
              <MenuItem value="waitlisted">Waitlisted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              value={statusForm.notes}
              onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleStatusUpdate}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OfficerApplicationDetail;

