# Quick Deploy to Vercel

## 🚀 One-Click Deployment

### For Windows Users:
```bash
deploy.bat
```

### For Mac/Linux Users:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Manual Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables Setup

Before deploying, add these to your Vercel project settings:

### Required Variables:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-14
SANITY_WRITE_TOKEN=your_sanity_write_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## ✅ What's Already Configured

- ✅ `vercel.json` - Optimized deployment settings
- ✅ `next.config.js` - Production-ready configuration
- ✅ Sentry integration for error monitoring
- ✅ Security headers
- ✅ Build optimizations
- ✅ TypeScript support
- ✅ Sanity Studio integration
- ✅ Firebase authentication
- ✅ Tailwind CSS styling

## 🎯 Your Project is Ready!

Your Next.js application is fully configured for Vercel deployment with:
- Modern tech stack (Next.js 14, TypeScript, Tailwind)
- Content management (Sanity CMS)
- Authentication (Firebase)
- Error monitoring (Sentry)
- Optimized build process
- Security best practices

Just add your environment variables and deploy! 🚀 