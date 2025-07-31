import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200 text-left text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="p-3 font-medium text-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable; 