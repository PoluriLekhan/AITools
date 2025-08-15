'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';

type Order = {
  _id: string;
  plan?: { name?: string; duration?: string };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  createdAt: string;
  planActivationDate?: string;
  planExpiryDate?: string | null;
};

export const dynamic = 'force-dynamic';

export default function OrderSuccessPage() {
  const Content = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get('orderId');

    useEffect(() => {
      if (!orderId) {
        router.push('/pricing');
        return;
      }

      const fetchOrder = async () => {
        try {
          const response = await fetch(`/api/orders?orderId=${orderId}`);
          const data = await response.json();
          
          if (data.success) {
            if (Array.isArray(data.orders) && data.orders.length > 0) {
              setOrder(data.orders[0]);
            } else if (data.order) {
              setOrder(data.order);
            } else {
              router.push('/pricing');
            }
          } else {
            router.push('/pricing');
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          router.push('/pricing');
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }, [orderId, router]);

    const downloadInvoice = () => {
      console.log('Downloading invoice for order:', orderId);
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!order) {
      return null;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your plan has been activated successfully</p>
          </div>

          {/* Order Details Card */}
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {order._id}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan Name:</span>
                <span className="font-semibold">{order.plan?.name || 'Unknown Plan'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan Duration:</span>
                <span className="font-semibold capitalize">{order.plan?.duration || 'Unknown'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Amount:</span>
                <span>₹{order.originalAmount}</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount Applied:</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-between items-center font-semibold text-lg">
                <span>Final Amount Paid:</span>
                <span className={order.finalAmount === 0 ? 'text-green-600' : ''}>
                  ₹{order.finalAmount}
                </span>
              </div>
              
              {order.couponCode && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Coupon Used:</span>
                  <span className="font-semibold text-green-600">{order.couponCode}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              
              {order.planActivationDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Activated:</span>
                  <span>{new Date(order.planActivationDate).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              
              {order.planExpiryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Expires:</span>
                  <span>{new Date(order.planExpiryDate).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={downloadInvoice}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            
            <Button
              onClick={() => router.push('/')}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              A confirmation email has been sent to your registered email address
            </p>
            <p className="text-sm text-gray-500">
              Need help? Contact our support team
            </p>
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