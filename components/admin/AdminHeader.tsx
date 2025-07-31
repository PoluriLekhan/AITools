import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface AdminHeaderProps {
  userEmail: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BadgeCheck className="text-green-600" size={24} />
            <span className="font-semibold text-green-700">
              Logged in as: {userEmail} (Admin)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">Admin Dashboard</h1>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader; 