import React from 'react';

const ProviderHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Management</h1>
        <p className="text-gray-600">Manage service providers and their onboarding process</p>
      </div>
    </div>
  );
};

export default ProviderHeader;
