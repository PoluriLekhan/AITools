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
  Settings, 
  DollarSign,
  Calendar,
  Star,
  CheckCircle
} from 'lucide-react';

export default function PlanManager() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [''],
    duration: 'month',
    currency: 'INR',
    isPopular: false,
    sortOrder: '0'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Filter out empty features
    const filteredFeatures = formData.features.filter((feature: string) => feature.trim() !== '');
    
    if (filteredFeatures.length === 0) {
      toast({
        title: "Error",
        description: "At least one feature is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: filteredFeatures,
          sortOrder: parseInt(formData.sortOrder)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: editingPlan ? "Plan updated successfully" : "Plan created successfully"
        });
        setShowForm(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
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
        description: "Failed to save plan",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      features: [''],
      duration: 'month',
      currency: 'INR',
      isPopular: false,
      sortOrder: '0'
    });
  };

  const editPlan = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      features: plan.features.length > 0 ? plan.features : [''],
      duration: plan.duration,
      currency: plan.currency,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder.toString()
    });
    setShowForm(true);
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Plan deleted successfully"
        });
        fetchPlans();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive"
      });
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plan Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
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
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plan Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Basic Plan"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="49"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPopular" className="text-sm font-medium">
                    Mark as Popular
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter plan description..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        required
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Feature
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
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

      {/* Plans List */}
      <div className="grid gap-4">
        {plans.map((plan: any) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 ${plan.isPopular ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-semibold">{plan.name}</span>
                    {plan.isPopular && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{plan.currency} {plan.price}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{plan.duration}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Features:</span>
                      <span>{plan.features.length}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600">Sort Order:</span>
                      <span>{plan.sortOrder}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editPlan(plan)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePlan(plan._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        
        {plans.length === 0 && (
          <Card className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Plans Found</h3>
            <p className="text-gray-500">Create your first pricing plan to get started</p>
          </Card>
        )}
      </div>
    </div>
  );
} 