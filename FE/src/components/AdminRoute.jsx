import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Debug info for development
    if (import.meta.env.DEV) {
      console.log('AdminRoute: Access denied. User role:', user?.role);
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
