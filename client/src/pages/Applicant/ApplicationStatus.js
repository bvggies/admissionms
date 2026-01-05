import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  HourglassEmpty,
  Cancel,
} from '@mui/icons-material';
import axios from 'axios';

const ApplicationStatus = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await axios.get('/applications/my-application');
      if (response.data.success) {
        setApplication(response.data.application);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'admitted':
        return <CheckCircle color="success" sx={{ fontSize: 60 }} />;
      case 'waitlisted':
        return <HourglassEmpty color="warning" sx={{ fontSize: 60 }} />;
      case 'rejected':
        return <Cancel color="error" sx={{ fontSize: 60 }} />;
      default:
        return <Pending color="info" sx={{ fontSize: 60 }} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      admitted: 'success',
      waitlisted: 'warning',
      rejected: 'error',
      pending: 'info',
      under_review: 'info',
    };
    return colors[status] || 'default';
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Application Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't submitted an application yet.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Application Status
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>{getStatusIcon(application.status)}</Box>
              <Typography variant="h6" gutterBottom>
                Application ID
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {application.application_id}
              </Typography>
              <Chip
                label={application.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(application.status)}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Details
            </Typography>
            <Grid container spacing={2}>
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
                  Submitted Date
                </Typography>
                <Typography variant="body1">
                  {new Date(application.submitted_at).toLocaleDateString()}
                </Typography>
              </Grid>
              {application.decision_date && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Decision Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(application.decision_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {application.ai_score && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    AI Evaluation Score
                  </Typography>
                  <Typography variant="body1">{application.ai_score}%</Typography>
                </Grid>
              )}
              {application.ai_recommendation && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    AI Recommendation
                  </Typography>
                  <Typography variant="body1">
                    {application.ai_recommendation.toUpperCase()}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {application.ai_explanation && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Evaluation Explanation
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {application.ai_explanation}
                  </Typography>
                </Paper>
              </Box>
            )}

            {application.officer_notes && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Officer Notes
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">{application.officer_notes}</Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ApplicationStatus;

