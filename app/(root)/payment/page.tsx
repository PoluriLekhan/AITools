'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { CheckCircle, CreditCard, Tag, ArrowLeft } from 'lucide-react';

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}

type Plan = {
  _id: string;
  name: string;
  description: string;
  features: string[];
  duration: 'month' | 'year' | 'lifetime';
  price: number;
};

export const dynamic = 'force-dynamic';

export default function PaymentPage() {
  const Content = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string } | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const planId = searchParams.get('planId');

  useEffect(() => {
    if (!planId) {
      router.push('/pricing');
      return;
    }

    fetchPlan();
  }, [planId]);

  useEffect(() => {
    if (plan) {
      setFinalAmount(plan.price - discountAmount);
    }
  }, [plan, discountAmount]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      
      if (data.success) {
        const selectedPlan = (data.plans as Plan[]).find((p: Plan) => p._id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
          setFinalAmount(selectedPlan.price);
        } else {
          toast({
            title: "Error",
            description: "Plan not found",
            variant: "destructive"
          });
          router.push('/pricing');
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch plan details",
        variant: "destructive"
      });
      router.push('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: (plan?.price ?? 0)
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.calculation.discountAmount);
        setFinalAmount(data.calculation.finalAmount);
        
        toast({
          title: "Success",
          description: `Coupon applied! ${data.calculation.discountAmount > 0 ? `₹${data.calculation.discountAmount} off` : 'Free plan!'}`,
        });
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
        description: "Failed to apply coupon",
        variant: "destructive"
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setFinalAmount(plan ? plan.price : 0);
    
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const processPayment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // If final amount is 0, create order directly
      if (finalAmount === 0) {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Prefer Firebase UID mapping if your backend expects MongoDB ObjectId, ensure user is created via /api/users/register and returned id is stored client-side
            userId: user.uid,
            planId: plan?._id ?? '',
            originalAmount: plan?.price ?? 0,
            discountAmount,
            finalAmount: 0,
            couponCode: appliedCoupon?.code,
            paymentMethod: 'free'
          })
        });

        const orderData = await orderResponse.json();
        
        if (orderData.success) {
          router.push(`/order-success?orderId=${orderData.order.id}`);
        } else {
          throw new Error(orderData.error);
        }
      } else {
        // Create Razorpay order
        const orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: finalAmount, 
            currency: 'INR' 
          })
        });

        const orderData = await orderResponse.json();
        
        if (!orderData.orderId) {
          throw new Error('Order creation failed');
        }

        // Initialize Razorpay
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          const options = {
            key: RAZORPAY_KEY,
            currency: 'INR',
            name: `${plan?.name ?? ''} Plan`,
            description: plan?.description ?? '',
            image: '/logo.png',
            order_id: orderData.orderId,
            amount: finalAmount * 100, // Convert to paise
            prefill: {
              name: user.displayName || '',
              email: user.email || '',
              contact: user.phoneNumber || ''
            },
            theme: {
              color: '#0d6efd'
            },
            handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; }) {
              try {
                // Create order in database
                const orderResponse = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.uid,
                    planId: plan?._id ?? '',
                    originalAmount: plan?.price ?? 0,
                    discountAmount,
                    finalAmount,
                    couponCode: appliedCoupon?.code,
                    paymentMethod: 'razorpay',
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    transactionId: response.razorpay_signature
                  })
                });

                const orderData = await orderResponse.json();
                
                if (orderData.success) {
                  router.push(`/order-success?orderId=${orderData.order.id}`);
                } else {
                  throw new Error(orderData.error);
                }
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Payment verification failed",
                  variant: "destructive"
                });
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        };

        document.body.appendChild(script);
      }
    } catch {
      toast({
        title: "Error",
        description: "Payment processing failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!plan) {
      return null;
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/pricing')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">Review your plan and apply any available discounts</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Name:</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold capitalize">{plan.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold text-right max-w-xs">{plan.description}</span>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon}
                      size="sm"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  ) : (
                    <Button
                      onClick={removeCoupon}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Tag className="w-4 h-4" />
                    <span>Coupon applied: {appliedCoupon.code}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span>₹{plan.price}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Final Amount:</span>
                  <span className={finalAmount === 0 ? 'text-green-600' : ''}>
                    ₹{finalAmount}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={processPayment}
                disabled={isProcessingPayment}
                className="w-full"
                size="lg"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : finalAmount === 0 ? (
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Activate Free Plan
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{finalAmount}
                  </div>
                )}
              </Button>

              {finalAmount === 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  No payment required for this plan
                </p>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
    );
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Content />
    </Suspense>
  );
} 