"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, Clock } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: string;
  _createdAt: string;
  expiresAt: string;
  sentBy: {
    _id: string;
    name: string;
    email: string;
  };
  userStatuses: Array<{
    userId: string;
    userEmail: string;
    seen: boolean;
    seenAt?: string;
    deleted: boolean;
  }>;
}

const NotificationBell = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unseenCount, setUnseenCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletionTimers, setDeletionTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  // Prevent multiple simultaneous fetches
  const [isFetchingNotifications, setIsFetchingNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch unseen notifications count
  const fetchUnseenCount = async () => {
    if (!user?.email) {
      console.warn("No user email, skipping notifications fetch (unseen count)");
      return;
    }
    if (isFetchingNotifications) return;
    setIsFetchingNotifications(true);
    try {
      const response = await fetch("/api/notifications/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, type: "count" }),
      });
      console.log("Request body for /api/notifications/fetch (count):", { userEmail: user.email, type: "count" });
      if (response.ok) {
        const count = await response.json();
        setUnseenCount(count);
      }
    } catch (error) {
      console.error("Error fetching unseen notifications count:", error);
    } finally {
      setIsFetchingNotifications(false);
    }
  };

  // Fetch all notifications
  const fetchNotifications = async (type: 'all' | 'count') => {
    if (loading || !user?.email) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, type }),
      });
      console.log("Request body for /api/notifications/fetch (all):", { userEmail: user.email, type: "all" });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as seen
  const markAllAsSeen = async () => {
    if (!user?.email) return;
    
    try {
      const unseenNotifications = notifications.filter(notification => {
        const userStatus = notification.userStatuses.find(
          status => status.userEmail === user.email
        );
        return !userStatus || !userStatus.seen;
      });

      if (unseenNotifications.length === 0) return;

      // Mark all unseen notifications as seen
      const promises = unseenNotifications.map(notification =>
        fetch("/api/notifications/mark-seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification._id, userEmail: user.email }),
        })
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        // Update local state for all notifications
        setNotifications(prev => 
          prev.map(notif => {
            const userStatus = notif.userStatuses.find(
              status => status.userEmail === user.email
            );
            if (!userStatus || !userStatus.seen) {
              return {
                ...notif,
                userStatuses: notif.userStatuses.map(status =>
                  status.userEmail === user.email
                    ? { ...status, seen: true, seenAt: new Date().toISOString() }
                    : status
                )
              };
            }
            return notif;
          })
        );
        
        setUnseenCount(0);
        
        // Start deletion timers for all marked notifications
        unseenNotifications.forEach(notification => {
          startDeletionTimer(notification._id);
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  // Mark single notification as seen
  const markAsSeen = async (notificationId: string) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, userEmail: user.email }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? {
                  ...notif,
                  userStatuses: notif.userStatuses.map(status =>
                    status.userEmail === user.email
                      ? { ...status, seen: true, seenAt: new Date().toISOString() }
                      : status
                  )
                }
              : notif
          )
        );
        setUnseenCount(prev => Math.max(0, prev - 1));
        
        // Start deletion timer
        startDeletionTimer(notificationId);
        
        toast({
          title: "Notification marked as seen",
          description: "This notification will be automatically deleted in 24 hours.",
        });
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as seen",
        variant: "destructive",
      });
    }
  };

  // Start deletion timer for a notification
  const startDeletionTimer = (notificationId: string) => {
    // Clear existing timer if any
    if (deletionTimers[notificationId]) {
      clearTimeout(deletionTimers[notificationId]);
    }

    // Set new timer for 24 hours
    const timer = setTimeout(async () => {
      // Call backend cleanup to remove expired notifications
      if (user?.email) {
        try {
          await fetch("/api/notifications/cleanup-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail: user.email }),
          });
          
          // Refresh notifications after cleanup
          fetchUnseenCount();
          fetchNotifications("all");
        } catch (error) {
          console.error("Error during notification cleanup:", error);
        }
      }
      
      // Clean up timer
      setDeletionTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[notificationId];
        return newTimers;
      });
    }, 24 * 60 * 60 * 1000); // 24 hours

    setDeletionTimers(prev => ({
      ...prev,
      [notificationId]: timer
    }));
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    setShowDropdown(false);
  };

  // Handle mark as seen from modal
  const handleMarkAsSeen = async () => {
    if (!selectedNotification) return;
    
    await markAsSeen(selectedNotification._id);
    setShowModal(false);
    setSelectedNotification(null);
  };

  // Check for new notifications every 30 seconds and cleanup expired ones
  useEffect(() => {
    if (!user?.email) return;

    const initializeNotifications = async () => {
      // Cleanup expired notifications first
      try {
        await fetch("/api/notifications/cleanup-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: user.email }),
        });
      } catch (error) {
        console.error("Error cleaning up expired notifications:", error);
      }

      // Then fetch current notifications
      fetchUnseenCount();
      fetchNotifications("all");
    };

    initializeNotifications();

    // Check for new notifications more frequently (every 10 seconds) to catch new notifications quickly
    const interval = setInterval(() => {
      fetchUnseenCount();
      fetchNotifications("all");
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Show popup for new notifications
  useEffect(() => {
    if (!user?.email || unseenCount === 0) return;

    const now = new Date();
    const shouldShowPopup = !lastChecked || 
      (now.getTime() - lastChecked.getTime()) > 24 * 60 * 60 * 1000; // 24 hours

    if (shouldShowPopup && unseenCount > 0) {
      setShowPopup(true);
      setLastChecked(now);
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
  }, [unseenCount, user, lastChecked]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(deletionTimers).forEach(timer => clearTimeout(timer));
    };
  }, [deletionTimers]);

  // Get user's unseen notifications
  const unseenNotifications = notifications.filter(notification => {
    const userStatus = notification.userStatuses.find(
      status => status.userEmail === user?.email
    );
    return !userStatus || !userStatus.seen;
  });

  if (!user) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setShowDropdown(!showDropdown);
          // Mark all notifications as seen when clicking the bell
          if (!showDropdown && unseenCount > 0) {
            markAllAsSeen();
          }
        }}
        className={`relative ${isMobile ? 'w-full justify-start px-4 py-3' : ''}`}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center notification-glow">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
        {isMobile && (
          <span className="ml-3 font-medium text-gray-700">Notifications</span>
        )}
      </Button>

      {/* Notification Popup */}
      {showPopup && !isMobile && (
        <div className="fixed top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">New Notification</h4>
              <p className="text-sm text-gray-600">
                You have {unseenCount} unseen notification{unseenCount !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPopup(false)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className={`absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto notification-scroll animate-scale-in ${
          isMobile 
            ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md notification-backdrop' 
            : 'right-0 mt-2 w-80'
        }`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unseenCount > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Auto-delete in 24h
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDropdown(false)}
                  className="h-6 w-6 notification-transition"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {unseenNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {unseenNotifications.map((notification) => {
                const userStatus = notification.userStatuses.find(
                  status => status.userEmail === user.email
                );
                const isSeen = userStatus?.seen || false;

                return (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer notification-transition ${
                      !isSeen ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !isSeen ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{notification.type}</span>
                          <span>•</span>
                          <span>{new Date(notification._createdAt).toLocaleDateString()}</span>
                          {!isSeen && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">New</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notification Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 notification-backdrop animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto notification-scroll animate-scale-in">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedNotification.type === 'important' ? 'bg-red-500' :
                    selectedNotification.type === 'update' ? 'bg-blue-500' :
                    selectedNotification.type === 'announcement' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedNotification.type === 'important' ? 'bg-red-100 text-red-800' :
                    selectedNotification.type === 'update' ? 'bg-blue-100 text-blue-800' :
                    selectedNotification.type === 'announcement' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedNotification.type}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedNotification(null);
                  }}
                  className="h-8 w-8 notification-transition"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedNotification.title}
                </h2>
                
                <p className="text-gray-700 leading-relaxed">
                  {selectedNotification.content}
                </p>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Sent: {new Date(selectedNotification._createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>From: {selectedNotification.sentBy?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Expires: {new Date(selectedNotification.expiresAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleMarkAsSeen}
                    className="w-full bg-blue-600 hover:bg-blue-700 notification-transition"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark as Seen
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This notification will be automatically deleted in 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell; 