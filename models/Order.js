const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  couponCode: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD']
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'free'],
    default: 'razorpay'
  },
  paymentId: {
    type: String,
    trim: true
  },
  orderId: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  planActivationDate: {
    type: Date
  },
  planExpiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 });

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  return {
    orderId: this._id,
    planName: this.plan?.name || 'Unknown Plan',
    originalAmount: this.originalAmount,
    discountAmount: this.discountAmount,
    finalAmount: this.finalAmount,
    couponUsed: this.couponCode,
    status: this.status,
    orderDate: this.createdAt
  };
});

// Ensure virtuals are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 