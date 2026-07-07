/**
 * Service Wizard Page
 * Entry point for the service creation wizard
 * Renders within DashboardLayout (keeps sidebar/header visible)
 */

import React from 'react';
import { ServiceWizard } from '../components/service-wizard/ServiceWizard';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';

const ServiceWizardPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Get partnerId from query params (for admin creating service for a partner)
  // Otherwise use logged-in user's ID (for partner creating their own service)
  const partnerIdFromQuery = searchParams.get('partnerId');
  const providerId = partnerIdFromQuery || user?.id;

  // The /camps/create route (or ?type=camp) → camp wizard; otherwise the service wizard.
  const entityType =
    location.pathname.startsWith('/camps/') || searchParams.get('type') === 'camp'
      ? 'camp'
      : 'service';

  // serviceId / campId present → edit mode. The row may be passed via router
  // state (from the admin list) to avoid an extra fetch.
  const editId =
    (entityType === 'camp'
      ? searchParams.get('campId')
      : searchParams.get('serviceId')) || undefined;
  const initialData =
    entityType === 'camp'
      ? (location.state as any)?.camp
      : (location.state as any)?.service;

  // Add Another Batch flow — creates a new batch under an existing service/camp.
  const addBatchMode = searchParams.get('addBatch') === '1';
  const parentId = searchParams.get('parentId') || undefined;
  const fromBatchId = searchParams.get('from') || undefined;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!providerId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-full">
      <ServiceWizard
        providerId={providerId}
        entityType={entityType}
        serviceId={editId}
        initialService={initialData}
        addBatchMode={addBatchMode}
        parentId={parentId}
        fromBatchId={fromBatchId}
      />
    </div>
  );
};

export default ServiceWizardPage;
