"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreateNotification = async () => {
    if (loading || !user?.uid || !title || !content || !type) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, sentByUserId: user.uid }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test notification sent! Check the notification bell in the navbar.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send test notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/cleanup", {
        method: "POST" });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || "Cleanup completed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to cleanup notifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cleanup notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notification System Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test the Notification System</h2>
          <p className="text-gray-600 mb-4">
            This page allows you to test the notification system functionality. 
            Use the buttons below to send test notifications and clean up expired ones.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
            <p className="text-blue-800">
              {user ? `Logged in as: ${user.email}` : "Not logged in"}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCreateNotification}
              disabled={loading || !user}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send Test Notification"}
            </Button>

            <Button
              onClick={handleCleanup}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Cleaning..." : "Cleanup Expired Notifications"}
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Send Test Notification" to create a new notification</li>
            <li>Look for the notification bell in the navbar - it should show a red badge</li>
            <li>Click the bell to see the notification dropdown</li>
            <li>Click on any notification to open the detailed modal</li>
            <li>In the modal, click "Mark as Seen" to mark it as read</li>
            <li>The notification will be automatically deleted after 24 hours</li>
            <li>Use "Cleanup Expired Notifications" to manually remove expired ones</li>
          </ol>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">Admin Features</h3>
          <p className="text-yellow-800">
            If you're an admin, you can also manage notifications from the{" "}
            <a href="/admin" className="underline font-medium">Admin Panel</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 