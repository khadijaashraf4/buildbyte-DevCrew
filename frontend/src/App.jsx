import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import BrowseOpportunities from './pages/BrowseOpportunities';
import OpportunityDetails from './pages/OpportunityDetails';

// Route Guard for Authenticated Users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div class="min-h-screen bg-slate-950 flex items-center justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Dashboard Route Selector based on Role
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'EMPLOYER') {
    return <EmployerDashboard />;
  }
  return <StudentDashboard />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardRouter />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <PrivateRoute>
                  <BrowseOpportunities />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/opportunities/:id" 
              element={
                <PrivateRoute>
                  <OpportunityDetails />
                </PrivateRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
