"use client";
import { useState } from "react";

export default function UpdateRolePage() {
  const [email, setEmail] = useState("lekhan2009visit@gmail.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUpdateRole = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `Successfully updated ${email} to admin role! You can now access the admin dashboard.`
        });
      } else {
        setResult({
          success: false,
          message: `Error: ${data.error}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Update User Role to Admin</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>
        <button onClick={handleUpdateRole} disabled={loading || !email}>
          {loading ? "Updating..." : "Update Role"}
        </button>
        {result && (
          <div className={`p-4 rounded-md ${
            result.success 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {result.message}
          </div>
        )}
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter the email address you want to make admin</li>
          <li>Click "Update to Admin"</li>
          <li>If successful, you can now access the admin dashboard</li>
          <li>Delete this page after use for security</li>
        </ol>
      </div>
    </div>
  );
} 