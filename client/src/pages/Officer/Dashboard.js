import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Description,
  Pending,
  CheckCircle,
  Assessment,
} from '@mui/icons-material';
import axios from 'axios';

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/officers/dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
      <Typography variant="h4" gutterBottom>
        Officer Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Description color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats?.totalApplications || 0}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Pending color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats?.pendingReviews || 0}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Pending Reviews
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats?.byStatus?.admitted || 0}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Admitted
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Assessment color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4">{stats?.byStatus?.waitlisted || 0}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Waitlisted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OfficerDashboard;

