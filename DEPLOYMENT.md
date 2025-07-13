# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Environment Variables**: You'll need to configure these in Vercel

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### Sanity Configuration
```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-14
SANITY_WRITE_TOKEN=your_sanity_write_token
```

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### NextAuth Configuration (if using)
```
AUTH_SECRET=your_auth_secret_key
AUTH_GITHUB_ID=your_github_oauth_id
AUTH_GITHUB_SECRET=your_github_oauth_secret
```

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

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
   vercel
   ```

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

### Method 3: Manual Upload

1. **Build your project locally**:
   ```bash
   npm run build
   ```

2. **Upload to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Choose "Upload" option
   - Upload your project folder

## Configuration Files

### vercel.json
This file is already configured for optimal deployment with:
- Build commands
- Function timeouts
- Security headers
- Regional deployment

### next.config.js
Your Next.js configuration is already optimized for production with:
- Sentry integration
- Image optimization
- TypeScript and ESLint build optimizations

## Post-Deployment Checklist

1. **Test all functionality**:
   - Authentication (Firebase)
   - Content management (Sanity)
   - API routes
   - Image loading

2. **Configure custom domain** (optional):
   - Go to your Vercel project settings
   - Add your custom domain
   - Configure DNS records

3. **Set up monitoring**:
   - Sentry is already configured
   - Check Vercel Analytics
   - Monitor function execution times

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set correctly
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **Runtime Errors**:
   - Check Vercel function logs
   - Verify API routes are working
   - Test environment variables in production

3. **Authentication Issues**:
   - Verify Firebase configuration
   - Check domain is added to Firebase authorized domains
   - Test OAuth providers

### Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Sentry Documentation**: [docs.sentry.io](https://docs.sentry.io)

## Performance Optimization

Your project is already optimized with:
- ✅ Next.js 14 with App Router
- ✅ Image optimization
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Sentry for error monitoring
- ✅ Firebase for authentication
- ✅ Sanity for content management

## Security

Security measures in place:
- ✅ Security headers configured
- ✅ Environment variables properly isolated
- ✅ Firebase security rules
- ✅ Sanity CORS configuration
- ✅ Next.js built-in security features 