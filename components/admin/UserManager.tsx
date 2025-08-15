'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  CreditCard, 
  Calendar,
  Eye,
  Mail,
  Phone,
  Tag
} from 'lucide-react';

export default function UserManager({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users-with-orders?adminId=${adminId}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      success: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || statusColors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="text-sm text-gray-600">
          Total Users: {users.length}
        </div>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((userData: any) => (
          <motion.div
            key={userData.user?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{userData.user.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{userData.user.email}</span>
                        </div>
                        {userData.user.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{userData.user.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatDate(userData.user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userData.totalOrders}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{userData.totalSpent}</div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{userData.activePlans}</div>
                      <div className="text-sm text-gray-600">Active Plans</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {userData.orders.filter((o: { couponCode?: string }) => o.couponCode).length}
                      </div>
                      <div className="text-sm text-gray-600">Coupons Used</div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {userData.orders.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Recent Orders</h4>
                      <div className="space-y-2">
                        {userData.orders.slice(0, 3).map((order: {
                          id: string | number;
                          planName: string;
                          status: string;
                          finalAmount: number;
                          orderDate: string | Date;
                          couponCode?: string;
                          discountAmount: number;
                        }) => (
                          <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{order.planName}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="text-sm text-gray-600">
                                ₹{order.finalAmount} • {formatDate(typeof order.orderDate === 'string' ? order.orderDate : order.orderDate.toISOString())}
                                {order.couponCode && (
                                  <span className="ml-2 text-green-600">
                                    • Coupon: {order.couponCode}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{order.finalAmount}</div>
                              <div className="text-xs text-gray-500">
                                {order.discountAmount > 0 && `-₹${order.discountAmount} off`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {userData.orders.length > 3 && (
                        <div className="text-center mt-3">
                          <Button variant="outline" size="sm">
                            View All {userData.orders.length} Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Orders Message */}
                  {userData.orders.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(selectedUser === userData.user.id ? null : userData.user.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedUser === userData.user.id ? 'Hide' : 'View'} Details
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedUser === userData.user.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t"
                >
                  <h4 className="font-semibold mb-3">All Orders</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userData.orders.map((order: any) => (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{order.planName}</span>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Order Date: {formatDate(order.orderDate)}</div>
                              <div>Payment Method: {order.paymentMethod}</div>
                              {order.couponCode && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Tag className="w-3 h-3" />
                                  <span>Coupon: {order.couponCode}</span>
                                </div>
                              )}
                              {order.planActivationDate && (
                                <div>Activated: {formatDate(order.planActivationDate)}</div>
                              )}
                              {order.planExpiryDate && (
                                <div>Expires: {formatDate(order.planExpiryDate)}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{order.finalAmount}</div>
                            <div className="text-xs text-gray-500">
                              Original: ₹{order.originalAmount}
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="text-xs text-green-600">
                                Saved: ₹{order.discountAmount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
        
        {users.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Users Found</h3>
            <p className="text-gray-500">Users will appear here once they register</p>
          </Card>
        )}
      </div>
    </div>
  );
} 