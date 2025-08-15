'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  Users,
  DollarSign,
  Percent
} from 'lucide-react';

export default function CouponManager({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    maxUses: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    description: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/create');
      const data = await response.json();
      
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          createdBy: adminId,
          discountValue: parseFloat(formData.discountValue),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
          maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: editingCoupon ? "Coupon updated successfully" : "Coupon created successfully"
        });
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save coupon",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expiryDate: '',
      maxUses: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      description: ''
    });
  };

  const editCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      maxUses: coupon.maxUses?.toString() || '',
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      description: coupon.description || ''
    });
    setShowForm(true);
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await fetch(`/api/coupons/create/${couponId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Coupon deleted successfully"
        });
        fetchCoupons();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses (optional)</label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                      placeholder="No limit"
                      min="0"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter coupon description..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Coupons List */}
      <div className="grid gap-4">
        {coupons.map((coupon: any) => (
          <motion.div
            key={coupon._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-4 ${isExpired(coupon.expiryDate) ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="font-mono font-semibold text-lg">{coupon.code}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      coupon.isActive && !isExpired(coupon.expiryDate) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive && !isExpired(coupon.expiryDate) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Discount:</span>
                      <div className="flex items-center gap-1">
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="w-3 h-3" />
                        ) : (
                          <DollarSign className="w-3 h-3" />
                        )}
                        <span className="font-semibold">
                          {coupon.discountValue}
                          {coupon.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Uses:</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{coupon.currentUses}/{coupon.maxUses || '∞'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Min Order:</span>
                      <span>₹{coupon.minOrderAmount}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Expires:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {coupon.description && (
                    <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editCoupon(coupon)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteCoupon(coupon._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        
        {coupons.length === 0 && (
          <Card className="p-8 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Coupons Found</h3>
            <p className="text-gray-500">Create your first coupon to get started</p>
          </Card>
        )}
      </div>
    </div>
  );
} 