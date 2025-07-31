import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface AdminSectionProps {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ 
  title, 
  loading = false, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default AdminSection; 