import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Applicant/Profile';
import Application from './pages/Applicant/Application';
import ApplicationStatus from './pages/Applicant/ApplicationStatus';
import OfficerDashboard from './pages/Officer/Dashboard';
import OfficerApplications from './pages/Officer/Applications';
import OfficerApplicationDetail from './pages/Officer/ApplicationDetail';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProgrammes from './pages/Admin/Programmes';
import AdminUsers from './pages/Admin/Users';
import AdminLogs from './pages/Admin/Logs';
import Reports from './pages/Reports';
import { Box } from '@mui/material';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</Box>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return children;
  }

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          {children}
        </Box>
      </Box>
    </>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['applicant']}>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/application"
              element={
                <PrivateRoute allowedRoles={['applicant']}>
                  <AppLayout>
                    <Application />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/application-status"
              element={
                <PrivateRoute allowedRoles={['applicant']}>
                  <AppLayout>
                    <ApplicationStatus />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/officer/dashboard"
              element={
                <PrivateRoute allowedRoles={['officer', 'admin']}>
                  <AppLayout>
                    <OfficerDashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/officer/applications"
              element={
                <PrivateRoute allowedRoles={['officer', 'admin']}>
                  <AppLayout>
                    <OfficerApplications />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/officer/applications/:id"
              element={
                <PrivateRoute allowedRoles={['officer', 'admin']}>
                  <AppLayout>
                    <OfficerApplicationDetail />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/programmes"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <AdminProgrammes />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <AdminUsers />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/admin/logs"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <AdminLogs />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <PrivateRoute allowedRoles={['officer', 'admin']}>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </PrivateRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
