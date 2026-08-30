import React, { useEffect, useState } from 'react';
import { dashboardApi, productsApi } from '../services/api';
import { BusinessHealthStats, TaskItem, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationsPopover } from './NotificationsPopover';
import { ProductStudio } from './ProductStudio';
import { VoiceMentor } from './VoiceMentor';
import { MarketplaceReadiness } from './MarketplaceReadiness';
import { GovernmentSchemes } from './GovernmentSchemes';
import { SubscriptionView } from './SubscriptionView';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import { BusinessProfileView } from './BusinessProfileView';
import { ImageStudio } from './ImageStudio';
import {
  LayoutDashboard,
  Package,
  Mic,
  Camera,
  Store,
  Landmark,
  Crown,
  User as UserIcon,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Circle,
  TrendingUp,
  ArrowRight,
  Plus,
  MapPin,
  Clock,
  Activity,
  AlertCircle,
  Lock,
  Zap,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { Logo } from './Logo';

interface DashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentTab, setCurrentTab, openPricingModal }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [stats, setStats] = useState<BusinessHealthStats | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [data, prodRes] = await Promise.all([
        dashboardApi.getStats(),
        productsApi.getAll().catch(() => ({ products: [] })),
      ]);
      setStats(data.stats);
      setTasks(data.tasks);
      setRecentProducts(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load workspace data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleToggleTask = async (taskId: string) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
      const res = await dashboardApi.toggleTask(taskId);
      if (res.tasks) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  // Auth Guard: If not logged in, prompt user to sign in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 sm:my-16 p-6 sm:p-8 bg-white dark:bg-[#13251B] rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xl text-center space-y-6 font-inter mx-4">
        <div className="w-16 h-16 bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-[#34D399] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-poppins text-stone-900 dark:text-white">
            Sign In Required
          </h2>
          <p className="text-xs text-stone-600 dark:text-emerald-200/70 leading-relaxed">
            Please sign in to access your business workspace, product studio, and AI voice mentor.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={openAuthModal}
            className="w-full py-3 bg-[#0F5132] hover:bg-[#0F5132]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => setCurrentTab('landing')}
            className="w-full py-2.5 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-700 dark:text-emerald-200 font-semibold text-xs rounded-xl transition-all cursor-pointer font-poppins"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'business-profile', label: 'Business Profile', icon: Building2 },
    { id: 'products', label: 'Product Studio', icon: Package },
    { id: 'mentor', label: 'AI Voice Mentor', icon: Mic, badge: 'Voice AI' },
    { id: 'images', label: 'Image Studio', icon: Camera, badge: 'Vision' },
    { id: 'marketplace', label: 'Marketplaces', icon: Store },
    { id: 'schemes', label: 'Government Schemes', icon: Landmark },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'profile', label: 'User Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Primary mobile destinations for bottom navigation bar
  const mobileBottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mentor', label: 'AI Mentor', icon: Mic, isSpecial: true },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'marketplace', label: 'Channels', icon: Store },
    { id: 'schemes', label: 'Schemes', icon: Landmark },
  ];

  // Search Filter logic for dashboard workspace search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderActiveView = () => {
    switch (currentTab) {
      case 'business-profile':
        return <BusinessProfileView />;
      case 'products':
        return <ProductStudio />;
      case 'mentor':
        return <VoiceMentor />;
      case 'images':
      case 'image-studio':
        return <ImageStudio />;
      case 'marketplace':
        return <MarketplaceReadiness />;
      case 'schemes':
        return <GovernmentSchemes />;
      case 'subscriptions':
        return <SubscriptionView openPricingModal={openPricingModal} />;
      case 'profile':
        return <ProfileView setCurrentTab={setCurrentTab} openPricingModal={openPricingModal} />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
            {/* Welcome Message Banner */}
            <div className="bg-gradient-to-r from-[#0F5132] via-[#123524] to-[#0B1911] text-white p-5 sm:p-7 md:p-8 rounded-3xl shadow-xl border border-[#0F5132]/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1A1A1A] font-poppins">
                      {user.role === 'shg' ? 'Self-Help Group' : 'Artisan Enterprise'}
                    </span>
                    <span className="text-xs text-emerald-200 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {user.location || 'India'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-poppins text-white leading-tight">
                    Welcome back, {user.name || user.full_name || 'Entrepreneur'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-inter">
                    {user.businessName || 'Your Enterprise'} is currently <strong className="text-[#D4AF37] font-semibold">{stats?.healthScore || 80}% Marketplace Ready</strong> for ONDC and Amazon Saheli.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-bold text-xs rounded-xl shadow-md transition-all font-poppins active:scale-98"
                  >
                    <Mic className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Talk to Voice Mentor</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('products')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 shadow-sm transition-all font-poppins"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider font-poppins">
                Quick Actions Workspace
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <button
                  onClick={() => setCurrentTab('products')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-400 border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">Add Product</span>
                </button>

                <button
                  onClick={() => setCurrentTab('mentor')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-400 border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">AI Voice Mentor</span>
                </button>

                <button
                  onClick={() => setCurrentTab('images')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-400 border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-300 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">Image Studio</span>
                </button>

                <button
                  onClick={() => setCurrentTab('marketplace')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-400 border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">Marketplaces</span>
                </button>

                <button
                  onClick={() => setCurrentTab('schemes')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#0F5132] dark:hover:border-emerald-400 border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">Schemes</span>
                </button>

                <button
                  onClick={() => setCurrentTab('subscriptions')}
                  className="p-3.5 bg-white dark:bg-[#13251B] hover:border-[#D4AF37] border border-[#0F5132]/15 dark:border-emerald-800/60 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all active:scale-98"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-emerald-100 font-poppins">Upgrade Plan</span>
                </button>
              </div>
            </div>

            {/* Business Health Card Metrics */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider font-poppins">
                  Real Business Health
                </h2>
                <span className="text-[11px] text-[#0F5132] dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-ping" />
                  Live Cloud Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* Metric 1 */}
                <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">Listed Products</span>
                    <div className="p-2 bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-400 rounded-lg">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-poppins">
                    {stats?.totalProducts || 0}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">Active catalog items</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">ONDC Ready</span>
                    <div className="p-2 bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] rounded-lg">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-poppins">
                    {stats?.marketplaceReadyProducts || 0} <span className="text-xs font-normal text-stone-400">/ {stats?.totalProducts || 0}</span>
                  </div>
                  <p className="text-[11px] text-[#2E7D32] dark:text-emerald-400 font-medium">Ready for national buyers</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">Readiness Score</span>
                    <div className="p-2 bg-[#2E7D32]/10 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-400 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-poppins">
                    {stats?.healthScore || 80}%
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0F5132] dark:bg-emerald-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${stats?.healthScore || 80}%` }}
                    />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">Monthly Revenue Potential</span>
                    <div className="p-2 bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-white font-poppins">
                    ₹{(stats?.estimatedMonthlyRevenue || 14800).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">Based on catalog inventory</p>
                </div>
              </div>
            </div>

            {/* AI Workspace Smart Suggestions */}
            <div className="bg-[#0F5132]/5 dark:bg-[#183023]/70 p-4 sm:p-5 rounded-2xl border border-[#0F5132]/20 dark:border-emerald-700/50 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs font-inter">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-stone-900 dark:text-white font-poppins">
                    AI Workspace Suggestion
                  </h3>
                  <span className="px-2 py-0.2 text-[9px] font-bold bg-[#D4AF37] text-[#1A1A1A] rounded uppercase font-poppins">
                    Smart Tip
                  </span>
                </div>
                <p className="text-stone-700 dark:text-emerald-100/90 leading-relaxed">
                  Adding 2 high-resolution photos against a plain natural background and listing material details increases ONDC buyer conversions by over 35%. Use the <strong>Product Studio</strong> to generate AI descriptions automatically.
                </p>
              </div>
            </div>

            {/* Main Content Grid: Tasks & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* Today's Tasks */}
              <div className="lg:col-span-7 bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/40">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                      Today's Action Tasks
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-emerald-300/70 font-inter">Complete tasks to increase marketplace score</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-[#0F5132]/20 dark:border-emerald-800 font-poppins">
                    {stats?.completedTasksCount || 0} / {tasks.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {filteredTasks.length === 0 ? (
                    <div className="py-6 text-center text-stone-400 dark:text-emerald-400/60 text-xs font-inter">
                      No matching tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          task.completed
                            ? 'bg-stone-50/70 dark:bg-[#183023]/50 border-stone-200/60 dark:border-emerald-900/40 text-stone-400 dark:text-emerald-400/60 opacity-80'
                            : 'bg-white dark:bg-[#13251B] border-stone-200/90 dark:border-emerald-800/60 hover:border-[#0F5132]'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-[#0F5132] dark:text-emerald-400 shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 fill-[#0F5132]/20 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 dark:text-emerald-800" />
                          )}
                        </button>
                        <div className="flex-1 space-y-0.5 font-inter">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-xs font-bold ${
                                task.completed ? 'line-through text-stone-400 dark:text-emerald-400/60' : 'text-stone-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-stone-500 dark:text-emerald-300/70 bg-stone-100 dark:bg-[#183023] px-2 py-0.5 rounded shrink-0">
                              {task.dueDate}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 leading-relaxed">{task.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Cards: Recent Activity & Recent Products */}
              <div className="lg:col-span-5 space-y-6">
                {/* Recent Products Preview */}
                <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-emerald-900/40">
                    <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-poppins">
                      Recent Products
                    </h3>
                    <button
                      onClick={() => setCurrentTab('products')}
                      className="text-xs font-bold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1 font-poppins"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {recentProducts.length === 0 ? (
                    <div className="py-6 text-center text-stone-400 dark:text-emerald-400/60 text-xs font-inter">
                      No products added yet. Click "Add Product" above to create one.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentProducts.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setCurrentTab('products')}
                          className="p-3 bg-stone-50 dark:bg-[#183023]/60 rounded-xl border border-stone-100 dark:border-emerald-900/40 flex items-center gap-3 cursor-pointer hover:border-[#0F5132] dark:hover:border-emerald-400 transition-all font-inter"
                        >
                          <img
                            src={prod.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300'}
                            alt={prod.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                              {prod.title}
                            </h4>
                            <p className="text-[11px] text-[#0F5132] dark:text-emerald-300 font-semibold">
                              ₹{prod.price} • {prod.category}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 rounded uppercase shrink-0 font-poppins">
                            Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-2xs space-y-4 font-inter">
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider font-poppins flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> Recent Activity Log
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 text-stone-600 dark:text-emerald-200/80">
                      <div className="w-2 h-2 rounded-full bg-[#0F5132] dark:bg-emerald-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-emerald-100">
                          Secure Session Active
                        </p>
                        <p className="text-[10px] text-stone-400 dark:text-emerald-400/60">Today, 09:10 AM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-stone-600 dark:text-emerald-200/80">
                      <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-emerald-100">
                          Profile details synchronized & backed up
                        </p>
                        <p className="text-[10px] text-stone-400 dark:text-emerald-400/60">Yesterday, 04:15 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-stone-600 dark:text-emerald-200/80">
                      <div className="w-2 h-2 rounded-full bg-[#2E7D32] mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-emerald-100">
                          PM Vishwakarma Scheme eligibility check completed
                        </p>
                        <p className="text-[10px] text-stone-400 dark:text-emerald-400/60">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F5] dark:bg-[#0B1911] text-[#1A1A1A] dark:text-[#E2F1E7] flex flex-col font-inter transition-colors">
      {/* Workspace Main Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#13251B]/95 backdrop-blur-md border-b border-[#0F5132]/10 dark:border-emerald-900/30 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Left: Brand & Sidebar Collapse / Mobile Drawer Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            aria-expanded={!isSidebarCollapsed}
            className="hidden md:flex p-2 rounded-xl text-stone-600 dark:text-emerald-200 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" /> : <ChevronLeft className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />}
          </button>

          {/* Mobile Drawer menu button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label={mobileDrawerOpen ? "Close Workspace Menu" : "Open Workspace Menu"}
            aria-expanded={mobileDrawerOpen}
            className="md:hidden p-2 rounded-xl text-stone-700 dark:text-emerald-200 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" /> : <Menu className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />}
          </button>

          <div
            tabIndex={0}
            role="button"
            aria-label="KRIVIO AI Workspace - Go to Home"
            onClick={() => setCurrentTab('landing')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentTab('landing');
              }
            }}
            className="flex items-center cursor-pointer select-none p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
          >
            <Logo variant="horizontal" size="xs" showTagline={false} />
          </div>
        </div>

        {/* Center: Search Bar (Hidden on small mobile) */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="w-4 h-4 text-stone-400 dark:text-emerald-400/60 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search workspace tasks, tools, schemes..."
            value={searchQuery}
            aria-label="Search workspace tasks, tools, and schemes"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-100 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
          />
        </div>

        {/* Right Tools: Notifications, Theme, User Avatar, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <NotificationsPopover onSelectTab={setCurrentTab} />

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-stone-600 dark:text-emerald-200 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F5132]" />}
          </button>

          <div className="h-6 w-px bg-stone-200 dark:border-emerald-900/40 mx-0.5 sm:mx-1 hidden sm:block" />

          {/* User Profile Summary */}
          <button
            onClick={() => setCurrentTab('profile')}
            aria-label="View User Profile"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132]"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F5132] text-white font-bold text-xs flex items-center justify-center border border-[#D4AF37]/50">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-stone-900 dark:text-white font-poppins leading-none">
                {user.name || user.full_name}
              </div>
              <div className="text-[10px] text-stone-400 dark:text-emerald-400/70 font-medium leading-none mt-1">
                {user.businessName || 'Artisan Enterprise'}
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Workspace Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Slide-in Drawer Overlay */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          />
        )}

        {/* Mobile Drawer (Slides from left on mobile) */}
        <aside
          aria-label="Mobile Navigation Drawer"
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#F8F9F5] dark:bg-[#0B1911] border-r border-[#0F5132]/15 dark:border-emerald-900/40 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-[#0F5132]/10 dark:border-emerald-900/40 flex items-center justify-between">
            <Logo variant="horizontal" size="xs" showTagline={false} />
            <button
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-emerald-900/40"
            >
              <X className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
            </button>
          </div>

          <nav aria-label="Mobile Workspace Links" className="p-3 space-y-1 overflow-y-auto flex-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileDrawerOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0F5132] text-white shadow-xs font-bold font-poppins'
                      : 'text-stone-700 dark:text-emerald-100 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400 dark:text-emerald-400/60'}`} />
                    <span className="font-poppins">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#D4AF37] text-[#1A1A1A] rounded uppercase font-poppins">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#0F5132]/10 dark:border-emerald-900/40 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-emerald-400/70">Subscription</span>
              <span className="font-bold text-[#0F5132] dark:text-[#34D399] uppercase text-[10px]">
                {user.subscriptionPlan === 'pro' ? 'Pro Member' : 'Free Tier'}
              </span>
            </div>
            {user.subscriptionPlan !== 'pro' && (
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  openPricingModal();
                }}
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-bold text-xs rounded-xl shadow-xs transition-all font-poppins"
              >
                Upgrade to Pro (₹299/mo)
              </button>
            )}
          </div>
        </aside>

        {/* Desktop Collapsible Sidebar */}
        <aside
          aria-label="Desktop Sidebar Navigation"
          className={`hidden md:flex bg-white dark:bg-[#13251B] border-r border-[#0F5132]/15 dark:border-emerald-900/40 transition-all duration-200 shrink-0 flex-col justify-between ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <nav aria-label="Workspace Sections" className="p-3 space-y-1 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5132] ${
                    isActive
                      ? 'bg-[#0F5132] text-white shadow-xs font-bold font-poppins'
                      : 'text-stone-700 dark:text-emerald-100 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400 dark:text-emerald-400/60'}`} />
                  {!isSidebarCollapsed && (
                    <span className="font-poppins truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#D4AF37] text-[#1A1A1A] rounded uppercase font-poppins">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Sidebar Footer */}
          {!isSidebarCollapsed && (
            <div className="p-4 m-3 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-2xl border border-[#0F5132]/10 dark:border-emerald-900/40 text-[11px] space-y-2 font-inter">
              <div className="flex items-center justify-between text-stone-500 dark:text-emerald-300/70">
                <span>Account Plan</span>
                <span className="font-bold text-[#0F5132] dark:text-[#34D399] uppercase text-[10px] font-poppins">
                  {user.subscriptionPlan === 'pro' ? 'Pro Member' : 'Free Tier'}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 dark:text-emerald-400/60 leading-tight">
                All systems operating normally.
              </p>
            </div>
          )}
        </aside>

        {/* Main Workspace Content Area */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#13251B]/95 backdrop-blur-md border-t border-[#0F5132]/15 dark:border-emerald-900/40 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#0F5132] dark:text-[#34D399] font-bold'
                  : 'text-stone-500 dark:text-emerald-300/70 hover:text-[#0F5132]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  item.isSpecial
                    ? 'bg-[#0F5132] text-white dark:bg-[#34D399] dark:text-[#0B1911] shadow-xs scale-105'
                    : isActive
                    ? 'bg-[#0F5132]/10 dark:bg-emerald-950'
                    : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isSpecial && !isActive ? 'text-[#D4AF37]' : ''}`} />
              </div>
              <span className="text-[10px] font-poppins mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-stone-500 dark:text-emerald-300/70 hover:text-[#0F5132]"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#0F5132]/10">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-poppins mt-0.5 leading-none">More</span>
        </button>
      </nav>
    </div>
  );
};
