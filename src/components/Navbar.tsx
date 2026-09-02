import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Logo } from './Logo';
import {
  Sun,
  Moon,
  Sparkles,
  User,
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

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openPricingModal }) => {
  const { user, openAuthModal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const isCurrentTabSecondary = isSecondaryTab(currentTab);

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

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

  // Close menus on Escape key for accessibility
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

  // Primary 4 items + "More"
  const directNavItems = PRIMARY_NAV_ITEMS.filter((item) => item.id !== 'more');

  return (
    <header className="sticky top-0 z-40 bg-[#F8F9F5]/90 dark:bg-[#0B1911]/90 backdrop-blur-md border-b border-[#0F5132]/10 dark:border-emerald-900/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
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
            aria-label={`${t('common.brand')} - ${t('nav.home')}`}
          >
            <Logo variant="horizontal" size="sm" showTagline={false} />
          </div>

          {/* Desktop Primary Navigation (Strictly 5 Destinations) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {directNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer ${
                    isActive
                      ? 'bg-[#0F5132] text-white shadow-xs font-bold font-poppins'
                      : 'text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/5 dark:hover:bg-emerald-900/30 font-poppins'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400 dark:text-emerald-400/70'}`} />
                  <span>{t(item.labelKey) || item.defaultLabel}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full uppercase ${
                      isActive
                        ? 'bg-white/20 text-[#D4AF37]'
                        : 'bg-[#D4AF37]/20 text-[#8B6E10] dark:bg-[#D4AF37]/30 dark:text-[#F3E5AB]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 5th Primary Item: Polished "More" Dropdown Popover */}
            <div className="relative">
              <button
                ref={moreButtonRef}
                id="nav-more-menu-btn"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                aria-expanded={moreDropdownOpen}
                aria-haspopup="true"
                aria-label="More Features Menu"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer ${
                  isCurrentTabSecondary || moreDropdownOpen
                    ? 'bg-[#0F5132]/10 dark:bg-emerald-950/70 text-[#0F5132] dark:text-emerald-300 font-bold border border-[#0F5132]/25 dark:border-emerald-800'
                    : 'text-stone-700 dark:text-emerald-100 hover:text-[#0F5132] dark:hover:text-white hover:bg-[#0F5132]/5 dark:hover:bg-emerald-900/30 font-poppins'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>{t('common.more')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180 text-[#0F5132] dark:text-emerald-400' : 'text-stone-400'}`} />
                {isCurrentTabSecondary && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" title="Active secondary page" />
                )}
              </button>

              {/* Desktop Popover Menu */}
              {moreDropdownOpen && (
                <div
                  ref={moreDropdownRef}
                  role="menu"
                  aria-label="Secondary Features"
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#13251B] rounded-2xl border border-[#0F5132]/20 dark:border-emerald-800/70 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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
                              onClick={() => handleNavClick(subItem.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-[#0F5132]/10 dark:bg-emerald-950/80 border border-[#0F5132]/30 dark:border-emerald-700'
                                  : 'hover:bg-stone-100/70 dark:hover:bg-emerald-900/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSubActive ? 'bg-[#0F5132] text-[#D4AF37]' : 'bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-400'
                                }`}>
                                  <SubIcon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className={`text-xs font-bold font-poppins truncate ${isSubActive ? 'text-[#0F5132] dark:text-emerald-300' : 'text-stone-900 dark:text-white'}`}>
                                    {t(subItem.labelKey) || subItem.defaultLabel}
                                  </div>
                                  <div className="text-[10px] text-stone-500 dark:text-emerald-400/70 truncate font-inter">
                                    {t(subItem.descriptionKey) || subItem.defaultDesc}
                                  </div>
                                </div>
                              </div>
                              {subItem.badge && (
                                <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#F3E5AB] rounded uppercase font-poppins shrink-0">
                                  {subItem.badge}
                                </span>
                              )}
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

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Pro Upgrade Badge / Button */}
            {user?.subscriptionPlan === 'pro' ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#D4AF37] text-[#1A1A1A] rounded-full shadow-xs font-poppins">
                <Crown className="w-3.5 h-3.5" />
                <span>{t('common.proBadge')}</span>
              </span>
            ) : (
              <button
                id="btn-upgrade-pro"
                onClick={openPricingModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0F5132] hover:bg-[#0B3D26] text-white rounded-xl shadow-xs transition-all active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 font-poppins cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('common.upgradePro')}</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              aria-label={t('common.switchTheme')}
              title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
              className="p-2 rounded-xl text-stone-600 dark:text-emerald-200 hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#0F5132]" />}
            </button>

            {/* Auth Button / User Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-emerald-900/40">
                <button
                  id="btn-profile-view"
                  onClick={() => handleNavClick('profile')}
                  aria-label={`${t('nav.profile')} - ${user.name}`}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F5132] text-white font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden lg:inline max-w-[100px] truncate font-inter">
                    {user.name}
                  </span>
                </button>
                <button
                  id="btn-logout"
                  onClick={logout}
                  title={t('common.logout')}
                  aria-label={t('common.logout')}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-auth"
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#1A1A1A] hover:bg-stone-800 dark:bg-emerald-100 dark:hover:bg-white text-white dark:text-[#0F5132] rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] dark:focus-visible:ring-emerald-400 cursor-pointer font-poppins"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('common.login')}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
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
          className="md:hidden bg-[#F8F9F5] dark:bg-[#0B1911] border-b border-[#0F5132]/15 dark:border-emerald-900/40 px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl max-h-[80vh] overflow-y-auto"
        >
          {/* Primary Mobile Items */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-emerald-400/60 px-2 font-poppins">
              Main Workspace
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {directNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-[#0F5132] text-white shadow-xs font-bold font-poppins'
                        : 'bg-white dark:bg-[#13251B] border border-stone-200/70 dark:border-emerald-900/40 text-stone-700 dark:text-emerald-100 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-[#0F5132] dark:text-emerald-400'}`} />
                    <span className="font-poppins truncate">{t(item.labelKey) || item.defaultLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Grouped Items */}
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
                      onClick={() => handleNavClick(subItem.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
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
                      {subItem.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#D4AF37] text-[#1A1A1A] rounded uppercase font-poppins shrink-0">
                          {subItem.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pro Plan CTA */}
          <div className="pt-2 border-t border-stone-200 dark:border-emerald-900/40">
            {user?.subscriptionPlan === 'pro' ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#D4AF37]/15 rounded-xl text-xs font-semibold text-[#8B6E10] dark:text-[#F3E5AB]">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('common.proBadge')}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  openPricingModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-bold rounded-xl shadow-xs transition-all font-poppins cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('common.upgradePro')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
