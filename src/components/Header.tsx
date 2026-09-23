import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  FileText,
  Lock,
  Clapperboard,
  Download,
  Video,
  User,
  CreditCard,
  Bell,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Shield,
  Smartphone
} from 'lucide-react';
import { Language, PlanConfig } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenGuide: () => void;
  onOpenDisclaimerModal: () => void;
  onOpenMovieModal?: () => void;
  onOpenPWAInstall?: () => void;
  onOpenAuthModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'create' | 'videos' | 'subscription' | 'payments' | 'profile' | 'admin') => void;
  currentTab: string;
  riskScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenGuide,
  onOpenDisclaimerModal,
  onOpenMovieModal,
  onOpenPWAInstall,
  onOpenAuthModal,
  onNavigateTab,
  currentTab,
  riskScore,
}) => {
  const isBn = language === 'bn';
  const { user, logout, notifications, unreadNotifsCount, markAllNotificationsRead, deviceInfo } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Left: FREE STUDIO Logo */}
        <div 
          onClick={() => onNavigateTab('dashboard')} 
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-lg shadow-red-500/25 p-0.5 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500/20" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-slate-950" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-black text-base sm:text-xl tracking-wider text-white">
                FREE STUDIO
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white uppercase tracking-wider">
                AI STUDIO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">
              {isBn ? 'এআই ভিডিও ক্রিয়েশন ও প্রসেসিং প্ল্যাটফর্ম' : 'AI Video Creation & Processing Platform'}
            </p>
          </div>
        </div>

        {/* Center: Quick App Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'text-slate-400 hover:text-white'
            }`}
          >
            ড্যাশবোর্ড
          </button>
          <button
            onClick={() => onNavigateTab('create')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              currentTab === 'create' ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Create Video</span>
          </button>
          <button
            onClick={() => onNavigateTab('videos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentTab === 'videos' ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Videos
          </button>
          <button
            onClick={() => onNavigateTab('subscription')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentTab === 'subscription' ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subscription
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigateTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer bg-amber-500/20 text-amber-300 border border-amber-500/30 ${
                currentTab === 'admin' ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        {/* Right: Notifications, Install, Auth & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Prominent Install App Button */}
          {onOpenPWAInstall && (
            <button
              onClick={onOpenPWAInstall}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition cursor-pointer active:scale-95 animate-pulse"
              title="মোবাইলে ইনস্টল করুন"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Notifications Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (unreadNotifsCount > 0) markAllNotificationsRead();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative cursor-pointer"
                title="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">নোটিফিকেশন</span>
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 pt-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">কোনো নোটিফিকেশন নেই</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="py-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Login Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigateTab('profile')}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.mobileNumber}`}
                  alt={user.fullName}
                  className="w-7 h-7 rounded-xl bg-slate-950 object-cover border border-slate-700"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-400">
                    {user.subscriptionPlan} PLAN
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>লগইন / রেজিস্টার</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition ${
                isBn ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাং
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition ${
                !isBn ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
