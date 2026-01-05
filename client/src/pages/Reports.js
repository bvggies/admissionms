import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import axios from 'axios';

const Reports = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/reports/statistics');
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/reports/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data');
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
        <Typography variant="h4">Reports & Analytics</Typography>
        <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
          Export CSV
        </Button>
      </Box>

      {statistics && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{statistics.overall?.total || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{statistics.overall?.admitted || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admitted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{statistics.overall?.waitlisted || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Waitlisted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{statistics.overall?.rejected || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics by Programme
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Programme</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Admitted</TableCell>
                    <TableCell align="right">Waitlisted</TableCell>
                    <TableCell align="right">Rejected</TableCell>
                    <TableCell align="right">Acceptance Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statistics.byProgramme?.map((prog) => (
                    <TableRow key={prog.programme_code}>
                      <TableCell>{prog.programme_name}</TableCell>
                      <TableCell align="right">{prog.total_applications || 0}</TableCell>
                      <TableCell align="right">{prog.admitted || 0}</TableCell>
                      <TableCell align="right">{prog.waitlisted || 0}</TableCell>
                      <TableCell align="right">{prog.rejected || 0}</TableCell>
                      <TableCell align="right">
                        {prog.acceptance_rate ? `${prog.acceptance_rate}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default Reports;

