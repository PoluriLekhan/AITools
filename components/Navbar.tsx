"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAuthorByEmail, fetchPendingBlogsCount } from "@/lib/sanity-client";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Plus, Shield, LogOut, User, LogIn, Bell, ExternalLink, Globe } from "lucide-react";
// Removed import { Dialog } from "@/components/ui/dialog"; because the module cannot be found

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAboutDropdownMobile, setShowAboutDropdownMobile] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Prevent body scroll when mobile menu is open and handle keyboard events
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        const authorResult = await fetchAuthorByEmail(user.email);
        const author = authorResult.success ? authorResult.data : null;
        setIsAdmin(!!author?.isAdmin);
        
        if (author?.isAdmin) {
          const pendingResult = await fetchPendingBlogsCount();
          const pendingCount = pendingResult.success ? pendingResult.data : 0;
          setPendingCount(pendingCount);
        } else {
          setPendingCount(0);
        }
        
      } else {
        setIsAdmin(false);
        setPendingCount(0);
      }
    };
    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push("/login");
    setMobileMenuOpen(false);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setMobileMenuOpen(false);
  };

  // Navigation links with icons
  interface NavLink {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isExternal?: boolean;
  }
  const portfolioSections = [
    { label: 'Home', anchor: 'home' },
    { label: 'About', anchor: 'about' },
    { label: 'Work', anchor: 'work' },
    { label: 'Contact', anchor: 'contact' },
  ];

  const navLinks: NavLink[] = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/useful-websites", label: "Useful Websites", icon: <Globe className="w-5 h-5" /> },
    { href: "/pricing", label: "Pricing", icon: <span className="w-5 h-5">💲</span> },
    ...(user ? [
      { href: "/submit", label: "Submit", icon: <Plus className="w-5 h-5" /> },
    ] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: <Shield className="w-5 h-5" />, badge: pendingCount }] : []),
  ];

  return (
    <>
      {/* About Modal */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white w-screen h-screen relative animate-fade-in flex flex-col items-center justify-center p-0">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold z-10 bg-white/80 rounded-full px-3 py-1 shadow"
              onClick={() => setAboutModalOpen(false)}
              aria-label="Close About"
            >
              ×
            </button>
            <iframe
              src="/Portifolio/index.html"
              title="Portfolio"
              className="w-full h-full border-0"
              style={{ minHeight: '100vh', minWidth: '100vw' }}
              allowFullScreen
            />
          </div>
        </div>
      )}
      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        aboutModalOpen
          ? 'bg-black'
          : isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="logo" 
                  width={144} 
                  height={30} 
                  priority 
                  className="h-8 w-auto drop-shadow-md transition-transform duration-300 hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Render navLinks except About */}
              {navLinks.map((link, idx) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="relative px-3 py-2 text-gray-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-semibold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {/* About Button */}
              <button
                onClick={() => setAboutModalOpen(true)}
                className="relative px-3 py-2 text-gray-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium flex items-center space-x-1 shadow-sm hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${navLinks.length * 60}ms` }}
              >
                <span>About</span>
              </button>
            </div>

            {/* Desktop User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <Link href={`/user/${user.email}`}>
                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all duration-200">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || ""} />
                      <AvatarFallback className="text-sm font-medium">
                        {user.displayName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => router.push("/login")} 
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                >
                  Login
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Mobile Notification Bell (if user is logged in) */}
              {user && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-700" />
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                aria-label="Toggle menu"
                className="relative z-50 h-10 w-10 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="logo" 
              width={120} 
              height={25} 
              priority 
              className="h-6 w-auto"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(false)}
            className="h-10 w-10 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          {user && (
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || user.email || ""} />
                  <AvatarFallback className="text-lg font-semibold">
                    {user.displayName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-gray-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* About Button for Mobile */}
              <button
                onClick={() => { setAboutModalOpen(true); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
              >
                About
              </button>
            </nav>

            {/* User Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavClick(`/user/${user.email}`)}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  >
                    <User className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                    <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                      My Profile
                    </span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                  >
                    <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                    <span className="font-medium group-hover:text-red-700 transition-colors duration-200">
                      Logout
                    </span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavClick("/login")}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                >
                  <LogIn className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
                  <span className="font-medium group-hover:text-blue-700 transition-colors duration-200">
                    Login
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
