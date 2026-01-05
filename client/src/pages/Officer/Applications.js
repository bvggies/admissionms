import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OfficerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    programmeId: '',
  });
  const [programmes, setProgrammes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const navigate = useNavigate();

  const fetchProgrammes = useCallback(async () => {
    try {
      const response = await axios.get('/admin/programmes');
      if (response.data.success) {
        setProgrammes(response.data.programmes);
      }
    } catch (error) {
      console.error('Error fetching programmes:', error);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      const response = await axios.get('/applications', { params });
      if (response.data.success) {
        setApplications(response.data.applications);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProgrammes();
    fetchApplications();
  }, [fetchProgrammes, fetchApplications]);

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, page: 1 });
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Applications
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="admitted">Admitted</MenuItem>
            <MenuItem value="waitlisted">Waitlisted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            select
            label="Programme"
            value={filters.programmeId}
            onChange={(e) => handleFilterChange('programmeId', e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Programmes</MenuItem>
            {programmes.map((prog) => (
              <MenuItem key={prog.id} value={prog.id}>
                {prog.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Application ID</TableCell>
                  <TableCell>Applicant Name</TableCell>
                  <TableCell>Programme</TableCell>
                  <TableCell>Campus</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>AI Score</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.application_id}</TableCell>
                    <TableCell>
                      {app.first_name} {app.last_name}
                    </TableCell>
                    <TableCell>{app.programme_name}</TableCell>
                    <TableCell>{app.campus}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(app.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{app.ai_score || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/officer/applications/${app.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={(e, page) => setPagination({ ...pagination, page })}
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default OfficerApplications;

