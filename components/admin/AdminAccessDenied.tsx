import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AdminAccessDeniedProps {
  userEmail?: string | null;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ userEmail }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center space-y-6 p-8 bg-white rounded-xl shadow-lg max-w-md">
        <AlertTriangle className="mx-auto text-red-500" size={64} />
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-gray-700">
            You do not have admin access. Please log in with an admin account.
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Logged in as: <span className="font-medium">{userEmail}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDenied; 