'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Tag, 
  CreditCard, 
  DollarSign, 
  Settings
} from 'lucide-react';
import CouponManager from '@/components/admin/CouponManager';
import UserManager from '@/components/admin/UserManager';
import PlanManager from '@/components/admin/PlanManager';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('coupons');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCoupons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.uid) return;
    
    try {
      const [usersResponse, ordersResponse, couponsResponse] = await Promise.all([
        fetch('/api/admin/users-with-orders?adminId=' + user.uid),
        fetch('/api/orders'),
        fetch('/api/coupons/create')
      ]);

      const usersData = await usersResponse.json();
      const couponsData = await couponsResponse.json();

      if (usersData.success) {
        setStats({
          totalUsers: usersData.totalUsers,
          totalOrders: usersData.totalOrders,
          totalRevenue: usersData.totalRevenue,
          activeCoupons: couponsData.success ? couponsData.coupons.filter((c: any) => c.isActive).length : 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform's users, plans, and coupons</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCoupons}</p>
                </div>
                <Tag className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <Tabs 
              tabs={[
                { label: 'Coupons', value: 'coupons' },
                { label: 'Users', value: 'users' },
                { label: 'Plans', value: 'plans' }
              ]}
              value={activeTab}
              onChange={setActiveTab}
              className="mb-6"
            />

            {activeTab === 'coupons' && (
              <CouponManager adminId={user?.uid || ''} />
            )}

            {activeTab === 'users' && (
              <UserManager adminId={user?.uid || ''} />
            )}

            {activeTab === 'plans' && (
              <PlanManager />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 