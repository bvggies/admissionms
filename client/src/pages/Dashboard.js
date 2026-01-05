import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
} from '@mui/material';
import {
  Person,
  Description,
  Assessment,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'applicant') {
      fetchApplicationStatus();
    }
  }, [user]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await axios.get('/applications/my-application');
      if (response.data.success && response.data.application) {
        setStats({
          hasApplication: true,
          status: response.data.application.status,
          applicationId: response.data.application.application_id,
        });
      } else {
        setStats({ hasApplication: false });
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
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

  if (user?.role !== 'applicant') {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please use the sidebar to navigate to your dashboard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your admission application
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Person color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Profile</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Complete your profile information
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/profile')}
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Description color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Application</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {stats?.hasApplication
                  ? 'View your application'
                  : 'Submit your application'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/application')}
                sx={{ mt: 2 }}
              >
                {stats?.hasApplication ? 'View Application' : 'Start Application'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Status</Typography>
              </Box>
              {stats?.hasApplication ? (
                <>
                  <Typography
                    variant="body2"
                    color={`${getStatusColor(stats.status)}.main`}
                    gutterBottom
                  >
                    Status: {stats.status.replace('_', ' ').toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {stats.applicationId}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No application submitted
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/application-status')}
                sx={{ mt: 2 }}
              >
                Check Status
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Quick Actions</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Common tasks
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/application-status')}
                >
                  View Status
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

