import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface AdminLoadingProps {
  message?: string;
}

export const AdminLoading: React.FC<AdminLoadingProps> = ({ message = "Loading admin dashboard..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <Spinner size="lg" className="mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          <p className="text-gray-600 text-sm">Please wait while we load your admin dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoading; 