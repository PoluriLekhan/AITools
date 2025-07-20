"use client";
import React, { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const providerGoogle = new GoogleAuthProvider();
const providerGithub = new GithubAuthProvider();

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const auth = getAuth(app);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.uid || !user.email) {
          toast({
            title: "Login error",
            description: "Missing user ID or email. Please try again.",
            variant: "destructive"
          });
          return;
        }
        if (!loadingProvider) { // Prevent repeated requests
          setLoadingProvider("sync");
          await fetch("/api/sync-firebase-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            }),
          });
          setLoadingProvider(null);
        }
        // Show welcome toast and redirect to home page
        toast({
          title: "Login successful!",
          description: `Welcome, ${user.displayName || user.email}!`,
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("justLoggedIn", "1");
          } catch (e) {
            console.warn("Could not set justLoggedIn in localStorage:", e);
          }
        }
        setTimeout(() => {
          router.push("/");
        }, 1200);
      }
    });
    return () => unsubscribe();
  }, [router, toast, auth, loadingProvider]);

  const handleProviderLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setLoadingProvider(provider);
    setError("");
    try {
      if (provider === "google") {
        await signInWithPopup(auth, providerGoogle);
      } else {
        await signInWithPopup(auth, providerGithub);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-pink-100/30 to-rose-100/30 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-indigo-100/30 to-blue-100/30 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-xl animate-float-medium" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-36 h-36 bg-gradient-to-br from-violet-100/30 to-purple-100/30 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
        
        {/* Abstract wave shapes */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/20 to-transparent transform -skew-y-6 origin-top-left"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-50/20 to-transparent transform skew-y-6 origin-bottom-right"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl mb-8 shadow-lg border border-white/20 animate-bounce-in">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 animate-slide-up">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto animate-slide-up-delayed">
            Sign in to access your AI tools dashboard and discover amazing solutions
          </p>
        </div>

        {/* Login Card with Glassmorphism */}
        <div className="w-full max-w-md animate-fade-in-delayed">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Google OAuth Button */}
              <button
                onClick={() => handleProviderLogin("google")}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-white text-gray-800 rounded-2xl px-6 py-4 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200/50 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-lg">
                    {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
                  </span>
                </div>
              </button>

              {/* GitHub OAuth Button */}
              <button
                onClick={() => handleProviderLogin("github")}
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gray-900 text-white rounded-2xl px-6 py-4 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-800/50 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-lg">
                    {loadingProvider === "github" ? "Signing in..." : "Continue with GitHub"}
                  </span>
                </div>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl text-red-700 text-center animate-shake">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{" "}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-300">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-300">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-delayed {
          animation: slide-up 0.8s ease-out 0.4s both;
        }
        
        .animate-bounce-in {
          animation: bounce-in 1s ease-out 0.2s both;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }

        /* Glassmorphism shadow */
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 