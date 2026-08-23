import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import {
  Mic,
  LayoutDashboard,
  Package,
  Camera,
  Store,
  Sun,
  Moon,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openPricingModal }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mentor', label: 'Voice AI Mentor', icon: Mic, badge: 'Voice AI' },
    { id: 'products', label: 'Product Studio', icon: Package },
    { id: 'images', label: 'Image Studio', icon: Camera },
    { id: 'marketplace', label: 'Marketplaces', icon: Store },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
  };

  // Close mobile menu on Escape key press for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F9F5]/90 dark:bg-[#0B1911]/90 backdrop-blur-md border-b border-[#0F5132]/10 dark:border-emerald-900/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="nav-logo"
            className="flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 rounded-lg p-1"
            onClick={() => handleNavClick('landing')}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavClick('landing');
              }
            }}
            aria-label="KRIVIO AI - Go to Home Page"
          >
            <Logo variant="horizontal" size="sm" showTagline={false} />
          </div>

          {/* Desktop Nav Items */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 ${
                    isActive
                      ? 'bg-[#0F5132]/10 dark:bg-emerald-950/70 text-[#0F5132] dark:text-emerald-300 font-semibold border border-[#0F5132]/20 dark:border-emerald-800/60 shadow-xs'
                      : 'text-stone-700 dark:text-emerald-100/80 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/5 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F5132] dark:text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#D4AF37]/20 text-[#8B6E10] dark:bg-[#D4AF37]/30 dark:text-[#F3E5AB] rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Pro Upgrade Badge */}
            {user?.subscriptionPlan === 'pro' ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#D4AF37] text-[#1A1A1A] rounded-full shadow-xs">
                <Crown className="w-3.5 h-3.5" />
                <span>Pro Mentor</span>
              </span>
            ) : (
              <button
                id="btn-upgrade-pro"
                onClick={openPricingModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0F5132] hover:bg-[#0F5132]/90 text-white rounded-lg shadow-sm transition-all active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Upgrade Pro</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg text-stone-600 dark:text-emerald-200 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#0F5132]" />}
            </button>

            {/* Auth Button / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-emerald-900/40">
                <button
                  id="btn-profile-view"
                  onClick={() => setCurrentTab('profile')}
                  aria-label={`View ${user.name}'s Profile`}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium hidden lg:inline max-w-[100px] truncate font-inter">
                    {user.name}
                  </span>
                </button>
                <button
                  id="btn-logout"
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#1A1A1A] hover:bg-stone-800 dark:bg-emerald-100 dark:hover:bg-white text-white dark:text-[#0F5132] rounded-lg shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              ref={toggleBtnRef}
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close main navigation menu' : 'Open main navigation menu'}
              className={`md:hidden p-2 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 ${
                mobileMenuOpen
                  ? 'bg-[#0F5132]/10 dark:bg-emerald-900/50 text-[#0F5132] dark:text-emerald-300'
                  : 'text-stone-700 dark:text-emerald-200 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 transition-transform duration-200 rotate-90" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile Navigation Drawer"
          className="md:hidden bg-[#F8F9F5] dark:bg-[#0B1911] border-b border-[#0F5132]/15 dark:border-emerald-900/40 px-4 pt-2 pb-5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 ${
                  isActive
                    ? 'bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 font-semibold border border-[#0F5132]/20 dark:border-emerald-800/60 shadow-xs'
                    : 'text-stone-700 dark:text-emerald-100 hover:bg-stone-200/60 dark:hover:bg-emerald-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#0F5132] dark:text-emerald-400' : 'text-stone-400'}`} />
                  <span className="font-poppins">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-[#D4AF37]/20 text-[#8B6E10] dark:bg-[#D4AF37]/30 dark:text-[#F3E5AB] rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-stone-200 dark:border-emerald-900/40 flex flex-col gap-2.5">
            {user?.subscriptionPlan === 'pro' ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#D4AF37]/15 rounded-xl text-xs font-semibold text-[#8B6E10] dark:text-[#F3E5AB]">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>Pro Mentor Subscription Active</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  openPricingModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 font-poppins focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Upgrade to Pro Plan (₹299/mo)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


