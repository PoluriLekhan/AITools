# Full-Stack Payment System

A comprehensive payment flow system built with React, Node.js, Express, and MongoDB, featuring coupon management, user registration, and admin dashboard.

## 🚀 Features

### User Side
- ✅ User registration and authentication
- ✅ Dynamic pricing plans from MongoDB
- ✅ Coupon code application with real-time validation
- ✅ Payment processing with Razorpay integration
- ✅ Free plan activation (100% discount coupons)
- ✅ Order success page with complete details
- ✅ Responsive and animated UI with TailwindCSS + Framer Motion

### Admin Side
- ✅ Admin dashboard with statistics
- ✅ Coupon creation and management
- ✅ User management with order history
- ✅ Plan creation and editing
- ✅ Real-time analytics

### Backend
- ✅ RESTful API endpoints
- ✅ MongoDB models with proper indexing
- ✅ Coupon validation and discount calculation
- ✅ Order management with payment tracking
- ✅ Admin authentication and authorization

## 📁 Project Structure

```
├── models/                    # MongoDB Models
│   ├── User.js               # User model with roles
│   ├── Plan.js               # Pricing plans model
│   ├── Coupon.js             # Coupon codes model
│   └── Order.js              # Orders model
├── app/api/                  # API Routes
│   ├── users/register/       # User registration
│   ├── plans/                # Plan management
│   ├── coupons/              # Coupon validation & creation
│   ├── orders/               # Order management
│   └── admin/                # Admin endpoints
├── app/(root)/               # Frontend Pages
│   ├── payment/              # Payment page
│   ├── order-success/        # Success page
│   └── admin/dashboard/      # Admin dashboard
├── components/admin/          # Admin Components
│   ├── CouponManager.tsx     # Coupon management
│   ├── UserManager.tsx       # User management
│   └── PlanManager.tsx       # Plan management
└── scripts/                  # Database scripts
    └── seed-database.js      # Initial data seeding
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/aitools_payment

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Firebase (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Make sure MongoDB is running locally or use MongoDB Atlas.

### 4. Initialize Database

Run the seed script to set up the database structure:

```bash
npm run seed
```

This will:
- Initialize the database connection
- Create necessary indexes for performance
- Set up the database structure for real data

### 5. Start Development Server

```bash
npm run dev
```

## 🎯 API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users (admin only)

### Plans
- `GET /api/plans` - Get all active plans
- `POST /api/plans` - Create new plan (admin only)

### Coupons
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons/create` - Create coupon (admin only)
- `GET /api/coupons/create` - Get all coupons (admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders (with filters)

### Admin
- `GET /api/admin/users-with-orders` - Get users with order history

## 💳 Payment Flow

1. **User selects a plan** from pricing page
2. **Redirects to payment page** with plan details
3. **User enters coupon code** (optional)
4. **Coupon validation** via API
5. **Price calculation** with discount applied
6. **Payment processing**:
   - If final amount = ₹0: Direct activation
   - If final amount > ₹0: Razorpay payment gateway
7. **Order creation** in database
8. **Success page** with order details

## 🎨 UI Features

- **Responsive Design**: Works on all devices
- **Animations**: Smooth transitions with Framer Motion
- **Toast Notifications**: User feedback for actions
- **Loading States**: Better UX during API calls
- **Modern UI**: Clean design with TailwindCSS

## 🔧 Admin Features

### Dashboard
- Total users, orders, revenue statistics
- Active coupons count
- Quick access to management tools

### Coupon Management
- Create/edit/delete coupons
- Set discount types (percentage/fixed)
- Configure usage limits and expiry dates
- Real-time validation

### User Management
- View all users with order history
- Track user spending and plan usage
- Monitor coupon usage per user

### Plan Management
- Create/edit/delete pricing plans
- Set features and pricing
- Mark popular plans
- Configure plan duration

## 🧪 Testing

### Test Payment Flow
1. Go to `/pricing`
2. Click "Buy Now" on any plan
3. Enter a coupon code (if you have created any through admin panel)
4. Complete payment (use Razorpay test mode)

### Admin Setup
1. Register a user through the normal flow
2. Manually update the user's role to 'admin' in the database
3. Access `/admin/dashboard` to create plans and coupons
4. Test the complete payment flow with real data

## 🔒 Security Features

- Admin role verification
- Coupon validation with expiry checks
- Payment verification
- User authentication required for payments
- Input validation and sanitization

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Database Setup
- Use MongoDB Atlas for production
- Set up proper indexes for performance
- Configure backup and monitoring

## 📝 Notes

- The system uses Firebase for authentication
- Razorpay is used for payment processing
- All amounts are in INR (Indian Rupees)
- Coupons support both percentage and fixed discounts
- Free plans (₹0) skip payment gateway entirely

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 