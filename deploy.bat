@echo off
echo 🚀 Starting Vercel deployment...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Vercel...
    vercel login
)

REM Build the project locally first
echo 🔨 Building project...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
) else (
    echo ✅ Build successful!
    
    REM Deploy to Vercel
    echo 🚀 Deploying to Vercel...
    vercel --prod
    
    echo 🎉 Deployment completed!
    echo 📝 Check your Vercel dashboard for the deployment URL
)

pause 