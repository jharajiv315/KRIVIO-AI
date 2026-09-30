import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Logo } from './Logo';
import {
  Sun,
  Moon,
  Sparkles,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronDown,
} from 'lucide-react';
import {
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_GROUPS,
  isSecondaryTab,
} from '../config/navigation';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

interface PublicNavLink {
  id: string;
  labelKey: string;
  defaultLabel: string;
  anchorId: string;
}

const PUBLIC_NAV_LINKS: PublicNavLink[] = [
  {
    id: 'product',
    labelKey: 'nav.product',
    defaultLabel: 'Product',
    anchorId: 'product',
  },
  {
    id: 'how-it-works',
    labelKey: 'nav.howItWorks',
    defaultLabel: 'How it works',
    anchorId: 'how-it-works',
  },
  {
    id: 'for-artisans',
    labelKey: 'nav.forArtisans',
    defaultLabel: 'For artisans',
    anchorId: 'for-artisans',
  },
  {
    id: 'pricing',
    labelKey: 'nav.pricing',
    defaultLabel: 'Pricing',
    anchorId: 'pricing',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openPricingModal,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const isCurrentTabSecondary = isSecondaryTab(currentTab);

  // Authenticated primary items (exclude 'more' as it is handled separately)
  const authenticatedPrimaryItems = useMemo(
    () => PRIMARY_NAV_ITEMS.filter((item) => item.id !== 'more'),
    []
  );

  // Track active section for public landing page navigation
  useEffect(() => {
    if (currentTab !== 'landing') {
      setActiveSection(null);
      return;
    }

    const sectionIds = ['product', 'how-it-works', 'for-artisans', 'pricing'];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      let matched: string | null = null;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            matched = id;
            break;
          }
        }
      }

      if (window.scrollY < 200) {
        setActiveSection(null);
      } else {
        setActiveSection(matched);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTab]);

  // Close desktop "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
    };

    if (moreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreDropdownOpen]);

  // Accessibility: Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (moreDropdownOpen) {
          setMoreDropdownOpen(false);
          moreButtonRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          toggleBtnRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moreDropdownOpen, mobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Navigation handlers
  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    if (!user) {
      if (currentTab !== 'landing') {
        setCurrentTab('landing');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handlePublicAnchorClick = (anchorId: string) => {
    setMobileMenuOpen(false);
    if (currentTab !== 'landing') {
      setCurrentTab('landing');
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAuthenticatedNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F9F5]/95 dark:bg-[#0B1911]/95 backdrop-blur-md border-b border-[#0F5132]/10 dark:border-emerald-900/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* ========================================================= */}
          {/* Brand Logo (Official KRIVIO AI horizontal emblem)        */}
          {/* ========================================================= */}
          <div className="flex items-center shrink-0">
            <button
              id="nav-logo"
              onClick={handleLogoClick}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
              aria-label={`${t('common.brand') || 'KRIVIO AI'} - ${user ? 'Dashboard' : t('nav.home') || 'Home'}`}
              className="flex items-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 rounded-lg p-1 transition-opacity hover:opacity-90"
            >
              <Logo variant="horizontal" size="sm" showTagline={false} />
            </button>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP NAVIGATION: DUAL EXPERIENCE                      */}
          {/* ========================================================= */}
          {user ? (
            /* ------------------------------------------------------- */
            /* C. AUTHENTICATED APPLICATION NAVIGATION                */
            /* ------------------------------------------------------- */
            <nav
              aria-label="Application Workspace Navigation"
              className="hidden md:flex items-center gap-1 lg:gap-1.5"
            >
              {authenticatedPrimaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleAuthenticatedNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer font-poppins ${
                      isActive
                        ? 'bg-[#0F5132] text-white shadow-xs'
                        : 'text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/8 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-[#D4AF37]'
                          : 'text-stone-400 dark:text-emerald-400/70'
                      }`}
                    />
                    <span>{t(item.labelKey) || item.defaultLabel}</span>
                  </button>
                );
              })}

              {/* Authenticated "More" Dropdown Menu */}
              <div className="relative">
                <button
                  ref={moreButtonRef}
                  id="nav-more-menu-btn"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  aria-expanded={moreDropdownOpen}
                  aria-haspopup="true"
                  aria-label="More Features Menu"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer font-poppins ${
                    isCurrentTabSecondary || moreDropdownOpen
                      ? 'bg-[#0F5132]/10 dark:bg-emerald-950/70 text-[#0F5132] dark:text-emerald-300 border border-[#0F5132]/25 dark:border-emerald-800'
                      : 'text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/8 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <Menu className="w-4 h-4 shrink-0" />
                  <span>{t('common.more') || 'More'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreDropdownOpen
                        ? 'rotate-180 text-[#0F5132] dark:text-emerald-400'
                        : 'text-stone-400'
                    }`}
                  />
                  {isCurrentTabSecondary && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                      title="Active secondary page"
                    />
                  )}
                </button>

                {/* Desktop Popover Menu */}
                {moreDropdownOpen && (
                  <div
                    ref={moreDropdownRef}
                    role="menu"
                    aria-label="Secondary Features"
                    className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#13251B] rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/70 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {SECONDARY_NAV_GROUPS.map((group) => (
                      <div key={group.id} className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 px-2 font-poppins">
                          {t(group.titleKey) || group.defaultTitle}
                        </h4>
                        <div className="space-y-0.5">
                          {group.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = currentTab === subItem.id;
                            return (
                              <button
                                key={subItem.id}
                                role="menuitem"
                                onClick={() =>
                                  handleAuthenticatedNavClick(subItem.id)
                                }
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSubActive
                                    ? 'bg-[#0F5132]/10 dark:bg-emerald-950/80 border border-[#0F5132]/30 dark:border-emerald-700'
                                    : 'hover:bg-stone-100/80 dark:hover:bg-emerald-900/30'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isSubActive
                                        ? 'bg-[#0F5132] text-[#D4AF37]'
                                        : 'bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-400'
                                    }`}
                                  >
                                    <SubIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className={`text-xs font-semibold font-poppins truncate ${
                                        isSubActive
                                          ? 'text-[#0F5132] dark:text-emerald-300'
                                          : 'text-stone-900 dark:text-white'
                                      }`}
                                    >
                                      {t(subItem.labelKey) || subItem.defaultLabel}
                                    </div>
                                    <div className="text-[10px] text-stone-500 dark:text-emerald-400/70 truncate font-inter">
                                      {t(subItem.descriptionKey) ||
                                        subItem.defaultDesc}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          ) : (
            /* ------------------------------------------------------- */
            /* A. PUBLIC LANDING-PAGE MARKETING NAVIGATION             */
            /* ------------------------------------------------------- */
            <nav
              aria-label="Public Landing Navigation"
              className="hidden md:flex items-center gap-1 lg:gap-2"
            >
              {PUBLIC_NAV_LINKS.map((link) => {
                const isSectionActive = activeSection === link.anchorId;
                return (
                  <button
                    key={link.id}
                    id={`nav-link-public-${link.id}`}
                    onClick={() => handlePublicAnchorClick(link.anchorId)}
                    className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 ${
                      isSectionActive
                        ? 'text-[#0F5132] dark:text-emerald-300 font-semibold bg-[#0F5132]/8 dark:bg-emerald-900/30'
                        : 'text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/5 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    {t(link.labelKey) || link.defaultLabel}
                  </button>
                );
              })}
            </nav>
          )}

          {/* ========================================================= */}
          {/* RIGHT ACTION CONTROLS & UTILITIES                         */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector (Compact) */}
            <LanguageSelector variant="compact" />

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              aria-label={t('common.switchTheme') || 'Switch theme'}
              title={
                theme === 'dark'
                  ? t('common.lightMode') || 'Light mode'
                  : t('common.darkMode') || 'Dark mode'
              }
              className="p-2 rounded-xl text-stone-600 dark:text-emerald-200 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F5132]" />
              )}
            </button>

            {/* Context-Specific Actions */}
            {user ? (
              /* Signed-in Utilities */
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-emerald-900/40">
                {/* Pro Upgrade / Pro Status */}
                {user.subscriptionPlan === 'pro' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#F3E5AB] border border-[#D4AF37]/30 rounded-full font-poppins">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('common.proBadge') || 'Pro'}</span>
                  </span>
                ) : (
                  <button
                    id="btn-upgrade-pro"
                    onClick={openPricingModal}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl shadow-xs transition-all active:scale-98 font-poppins cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{t('common.upgradePro') || 'Upgrade'}</span>
                  </button>
                )}

                {/* User Profile Avatar */}
                <button
                  id="btn-profile-view"
                  onClick={() => handleAuthenticatedNavClick('profile')}
                  aria-label={`${t('nav.profile') || 'Profile'} - ${user.name}`}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50 shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden xl:inline max-w-[110px] truncate font-inter">
                    {user.name}
                  </span>
                </button>

                {/* Sign Out Action */}
                <button
                  id="btn-logout"
                  onClick={logout}
                  title={t('common.logout') || 'Log out'}
                  aria-label={t('common.logout') || 'Log out'}
                  className="hidden sm:inline-flex p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public / Logged-out Calls to Action */
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Secondary: Sign in */}
                <button
                  id="btn-nav-signin"
                  onClick={() => openAuthModal('login')}
                  className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white transition-colors cursor-pointer font-poppins focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
                >
                  {t('nav.signIn') || 'Sign in'}
                </button>

                {/* Primary: Get started */}
                <button
                  id="btn-nav-getstarted"
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl shadow-xs transition-all hover:shadow-sm active:scale-98 cursor-pointer font-poppins focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 whitespace-nowrap"
                >
                  {t('nav.getStarted') || 'Get started'}
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Trigger (Strictly 44x44px Touch Target) */}
            <button
              ref={toggleBtnRef}
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                mobileMenuOpen
                  ? 'Close main navigation menu'
                  : 'Open main navigation menu'
              }
              className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer ${
                mobileMenuOpen
                  ? 'bg-[#0F5132]/10 dark:bg-emerald-900/50 text-[#0F5132] dark:text-emerald-300'
                  : 'text-stone-700 dark:text-emerald-200 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-200" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE NAVIGATION DRAWER & BACKDROP                       */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed inset-x-0 top-[68px] z-50 md:hidden bg-[#F8F9F5] dark:bg-[#0B1911] border-b border-[#0F5132]/15 dark:border-emerald-900/40 shadow-2xl p-5 space-y-4 max-h-[calc(100vh-68px)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {user ? (
              /* Authenticated Mobile Navigation */
              <div className="space-y-4">
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#13251B] rounded-2xl border border-stone-200/70 dark:border-emerald-900/40">
                  <div className="w-10 h-10 rounded-full bg-[#0F5132] text-white font-bold text-sm flex items-center justify-center border border-[#D4AF37]/50 shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-stone-900 dark:text-white truncate font-poppins">
                      {user.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-emerald-400/80 truncate font-inter">
                      {user.email || 'Artisan Entrepreneur'}
                    </div>
                  </div>
                  {user.subscriptionPlan === 'pro' && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#F3E5AB] rounded-full uppercase shrink-0 font-poppins">
                      Pro
                    </span>
                  )}
                </div>

                {/* Primary Tools */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 px-2 font-poppins">
                    Workspace
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {authenticatedPrimaryItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`mobile-nav-link-${item.id}`}
                          onClick={() => handleAuthenticatedNavClick(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`min-h-[44px] flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-[#0F5132] text-white shadow-xs font-bold font-poppins'
                              : 'bg-white dark:bg-[#13251B] border border-stone-200/70 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-100 hover:bg-stone-100 dark:hover:bg-emerald-900/30'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-[#D4AF37]'
                                : 'text-[#0F5132] dark:text-emerald-400'
                            }`}
                          />
                          <span className="font-poppins truncate">
                            {t(item.labelKey) || item.defaultLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Groups */}
                {SECONDARY_NAV_GROUPS.map((group) => (
                  <div key={group.id} className="space-y-1 pt-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 px-2 font-poppins">
                      {t(group.titleKey) || group.defaultTitle}
                    </h4>
                    <div className="bg-white dark:bg-[#13251B] rounded-2xl border border-[#0F5132]/10 dark:border-emerald-900/40 p-1.5 space-y-0.5">
                      {group.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = currentTab === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() =>
                              handleAuthenticatedNavClick(subItem.id)
                            }
                            className={`min-h-[44px] w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 font-bold'
                                : 'text-stone-700 dark:text-emerald-100 hover:bg-stone-100/70 dark:hover:bg-emerald-900/30'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <SubIcon className="w-4 h-4 text-[#0F5132] dark:text-emerald-400 shrink-0" />
                              <span className="text-xs font-semibold font-poppins truncate">
                                {t(subItem.labelKey) || subItem.defaultLabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Mobile Pro CTA */}
                {user.subscriptionPlan !== 'pro' && (
                  <div className="pt-2 border-t border-stone-200 dark:border-emerald-900/40">
                    <button
                      onClick={() => {
                        openPricingModal();
                        setMobileMenuOpen(false);
                      }}
                      className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs transition-all font-poppins cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t('common.upgradePro') || 'Upgrade to Pro'}</span>
                    </button>
                  </div>
                )}

                {/* Sign Out */}
                <div className="pt-2 border-t border-stone-200 dark:border-emerald-900/40">
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-xl transition-colors font-poppins cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout') || 'Log out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Public Mobile Navigation (Logged-out) */
              <div className="space-y-4">
                {/* Public Links */}
                <div className="space-y-1">
                  {PUBLIC_NAV_LINKS.map((link) => {
                    const isSectionActive = activeSection === link.anchorId;
                    return (
                      <button
                        key={link.id}
                        id={`mobile-nav-link-public-${link.id}`}
                        onClick={() => handlePublicAnchorClick(link.anchorId)}
                        className={`min-h-[44px] w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer font-inter ${
                          isSectionActive
                            ? 'bg-[#0F5132] text-white font-semibold'
                            : 'text-stone-800 dark:text-emerald-100 hover:bg-stone-200/60 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        {t(link.labelKey) || link.defaultLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Action CTAs */}
                <div className="pt-3 border-t border-stone-200 dark:border-emerald-900/40 space-y-2.5">
                  <button
                    id="mobile-btn-getstarted"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="min-h-[44px] w-full flex items-center justify-center px-4 py-3 text-sm font-semibold bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl shadow-xs transition-all font-poppins cursor-pointer"
                  >
                    {t('nav.getStarted') || 'Get started'}
                  </button>
                  <button
                    id="mobile-btn-signin"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="min-h-[44px] w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-stone-800 dark:text-emerald-100 hover:bg-stone-200/60 dark:hover:bg-emerald-900/30 border border-stone-200 dark:border-emerald-800/40 rounded-xl transition-colors font-poppins cursor-pointer"
                  >
                    {t('nav.signIn') || 'Sign in'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};
