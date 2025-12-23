import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyDetail from './pages/CompanyDetail';
import AllCompanies from './pages/AllCompanies';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Guidelines from './pages/Guidelines';
import Contact from './pages/Contact';
import Sitemap from './pages/Sitemap';
import WriteReview from './pages/WriteReview';
import ReviewDetail from './pages/ReviewDetail';
import { AdminDashboard, AdminReviews, AdminUsers, AdminCompanies, AdminRoles } from './pages/admin';
import { API_BASE_URL } from './config/api';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isDevelopment = import.meta.env.DEV;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
        <div className="app">
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminReviews />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminCompanies />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminRoles />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/companies" element={<MainLayout><AllCompanies /></MainLayout>} />
            <Route path="/companies/:id" element={<MainLayout><CompanyDetail /></MainLayout>} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
            <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
            <Route path="/guidelines" element={<MainLayout><Guidelines /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            <Route path="/sitemap" element={<MainLayout><Sitemap /></MainLayout>} />
            <Route path="/write-review" element={<MainLayout><WriteReview /></MainLayout>} />
            <Route path="/reviews/:id" element={<MainLayout><ReviewDetail /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {isDevelopment && (
            <div style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              padding: '8px 12px',
              fontSize: '11px',
              color: '#666',
              zIndex: 1000,
              maxWidth: '300px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>API URL:</strong><br />
              <code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{API_BASE_URL}</code>
            </div>
          )}
        </div>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
