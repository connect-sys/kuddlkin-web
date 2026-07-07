import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PendingApprovalMessage from '../PendingApprovalMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'partner' | 'customer';
  requiresApproval?: boolean; // New prop to check if route requires admin approval
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiresApproval = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kuddl-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-kuddl-green mx-auto mb-4"></div>
          <p className="text-kuddl-green font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  const isAdmin = user?.email === 'tech@tendernest.world' || user?.email === 'admin@kuddl.co' || user?.role === 'admin';
  const isServiceWorker = user?.role === 'service_worker';

  // Service workers always pass through — sidebar handles their permission filtering
  if (isServiceWorker) {
    return <>{children}</>;
  }
  
  if (requiredRole) {
    // If admin role is required, check if user is admin (by email or role)
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // If partner role is required, check if user is partner
    if (requiredRole === 'partner' && isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // If other specific role is required but user doesn't have it
    if (requiredRole !== 'admin' && requiredRole !== 'partner' && user?.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if route requires admin approval (only for non-admin users)
  if (requiresApproval && !isAdmin) {
    const isPartnerApproved = user?.kyc_status === 'verified' || user?.status === 'approved' || user?.status === 'active';
    
    if (!isPartnerApproved) {
      // Show pending approval message instead of redirecting
      return <PendingApprovalMessage />;
    }
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};

export default ProtectedRoute;
