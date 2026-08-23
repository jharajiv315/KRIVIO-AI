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
} from 'lucide-react';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-collapse sidebar on window resize if small screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 font-inter">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Sign In Required
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please sign in to access your business workspace, product studio, and AI voice mentor.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={openAuthModal}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => setCurrentTab('landing')}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer"
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
    { id: 'mentor', label: 'AI Mentor', icon: Mic, badge: 'Voice AI' },
    { id: 'images', label: 'Image Studio', icon: Camera, badge: 'Vision' },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'schemes', label: 'Government Schemes', icon: Landmark },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'profile', label: 'User Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Welcome Message Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900">
                      {user.role === 'shg' ? 'Self-Help Group' : 'Artisan Enterprise'}
                    </span>
                    <span className="text-xs text-emerald-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location || 'India'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-display">
                    Welcome back, {user.name || user.full_name || 'Entrepreneur'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    {user.businessName || 'Your Enterprise'} is currently <strong className="text-emerald-400 font-semibold">{stats?.healthScore || 80}% Marketplace Ready</strong> for ONDC and Amazon Saheli.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setCurrentTab('mentor')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all font-poppins hover:scale-[1.02]"
                  >
                    <Mic className="w-4 h-4 text-slate-950" />
                    <span>Talk to Voice Mentor</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('products')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 shadow-sm transition-all font-poppins"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-poppins">
                Quick Actions Workspace
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setCurrentTab('products')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Product</span>
                </button>

                <button
                  onClick={() => setCurrentTab('mentor')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Voice Mentor</span>
                </button>

                <button
                  onClick={() => setCurrentTab('images')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Image Studio</span>
                </button>

                <button
                  onClick={() => setCurrentTab('marketplace')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Marketplaces</span>
                </button>

                <button
                  onClick={() => setCurrentTab('schemes')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Schemes</span>
                </button>

                <button
                  onClick={() => setCurrentTab('subscriptions')}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:border-amber-500 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-2xs transition-all hover:scale-[1.02]"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upgrade Plan</span>
                </button>
              </div>
            </div>

            {/* Business Health Card Metrics */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-poppins">
                  Real Business Health
                </h2>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Live Cloud Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Listed Products</span>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                    {stats?.totalProducts || 0}
                  </div>
                  <p className="text-[11px] text-slate-500">Active catalog items</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">ONDC Ready</span>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-lg">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                    {stats?.marketplaceReadyProducts || 0} <span className="text-xs font-normal text-slate-400">/ {stats?.totalProducts || 0}</span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ready for national buyers</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Readiness Score</span>
                    <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                    {stats?.healthScore || 80}%
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${stats?.healthScore || 80}%` }}
                    />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Monthly Revenue Potential</span>
                    <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                    ₹{(stats?.estimatedMonthlyRevenue || 14800).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500">Based on catalog inventory</p>
                </div>
              </div>
            </div>

            {/* AI Workspace Smart Suggestions */}
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent p-5 rounded-2xl border border-amber-500/20 dark:border-amber-500/30 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white font-display">
                    AI Workspace Suggestion
                  </h3>
                  <span className="px-2 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded uppercase">
                    Smart Tip
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Adding 2 high-resolution photos against a plain natural background and listing material details increases ONDC buyer conversions by over 35%. Use the <strong>Product Studio</strong> to generate AI descriptions automatically.
                </p>
              </div>
            </div>

            {/* Main Content Grid: Tasks & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Today's Tasks */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      Today's Action Tasks
                    </h3>
                    <p className="text-xs text-slate-500">Complete tasks to increase marketplace score</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                    {stats?.completedTasksCount || 0} / {tasks.length} Done
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No matching tasks found.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          task.completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-80'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-xs font-bold ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {task.dueDate}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar Cards: Recent Activity & Recent Products */}
              <div className="lg:col-span-5 space-y-6">
                {/* Recent Products Preview */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-poppins">
                      Recent Products
                    </h3>
                    <button
                      onClick={() => setCurrentTab('products')}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {recentProducts.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No products added yet. Click "Add Product" above to create one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentProducts.slice(0, 3).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setCurrentTab('products')}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition-all"
                        >
                          <img
                            src={prod.imageUrls[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300'}
                            alt={prod.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {prod.title}
                            </h4>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ₹{prod.price} • {prod.category}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded uppercase shrink-0">
                            Ready
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-poppins flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" /> Recent Activity Log
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Secure Session Active
                        </p>
                        <p className="text-[10px] text-slate-400">Today, 09:10 AM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          Profile details synchronized & backed up
                        </p>
                        <p className="text-[10px] text-slate-400">Yesterday, 04:15 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          PM Vishwakarma Scheme eligibility check completed
                        </p>
                        <p className="text-[10px] text-slate-400">2 days ago</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-inter transition-colors">
      {/* Workspace Main Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Sidebar Collapse Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            aria-expanded={!isSidebarCollapsed}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div
            tabIndex={0}
            role="button"
            aria-label="Go to Home"
            onClick={() => setCurrentTab('landing')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentTab('landing');
              }
            }}
            className="flex items-center gap-2 cursor-pointer select-none p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center font-display shadow-xs shrink-0">
              K
            </div>
            <span className="text-sm font-extrabold font-display text-emerald-800 dark:text-emerald-400 tracking-tight">
              KRIVIO <span className="hidden sm:inline font-normal text-slate-500 dark:text-slate-400 text-xs">AI Workspace</span>
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search workspace tasks, tools, schemes..."
            value={searchQuery}
            aria-label="Search workspace tasks, tools, and schemes"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Right Tools: Notifications, Theme, User Avatar, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationsPopover onSelectTab={setCurrentTab} />

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-emerald-700" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* User Profile Summary */}
          <button
            onClick={() => setCurrentTab('profile')}
            aria-label="View User Profile"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center border border-amber-400/50">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white font-poppins leading-none">
                {user.name || user.full_name}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-none mt-1">
                {user.businessName || 'Artisan Enterprise'}
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            aria-label="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Workspace Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay when Sidebar is Expanded on small screens */}
        {!isSidebarCollapsed && (
          <div
            onClick={() => setIsSidebarCollapsed(true)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
          />
        )}

        {/* Collapsible Sidebar Navigation */}
        <aside
          aria-label="Sidebar Navigation"
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 shrink-0 flex flex-col justify-between ${
            isSidebarCollapsed
              ? 'w-16'
              : 'fixed inset-y-0 left-0 z-40 w-64 shadow-2xl md:shadow-none md:static md:z-auto'
          }`}
        >
          <nav aria-label="Workspace Sections" className="p-3 space-y-1.5 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (window.innerWidth < 768) {
                      setIsSidebarCollapsed(true);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && (
                    <span className="font-poppins truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-400 text-slate-950 rounded uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          {!isSidebarCollapsed && (
            <div className="p-4 m-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-2 font-inter">
              <div className="flex items-center justify-between text-slate-500">
                <span>Account Plan</span>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">
                  {user.subscriptionPlan === 'pro' ? 'Pro Member' : 'Free Tier'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                All systems operating normally.
              </p>
            </div>
          )}
        </aside>

        {/* Main Workspace Content Area */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-3 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
