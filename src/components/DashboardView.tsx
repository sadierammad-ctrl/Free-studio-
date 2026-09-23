import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Video, 
  Play, 
  CreditCard, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Smartphone, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Star,
  Award,
  Crown,
  AlertTriangle,
  Film
} from 'lucide-react';
import { PlanId } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'create' | 'videos' | 'subscription' | 'payments' | 'profile' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab, onOpenAuthModal }) => {
  const { user, settings, logout, deviceInfo, deviceConflict } = useAuth();

  const getPlanBadge = (plan: PlanId) => {
    switch (plan) {
      case 'GO':
        return <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">🟢 GO PLAN</span>;
      case 'PLUS':
        return <span className="px-3 py-1 rounded-xl text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">🔵 PLUS PLAN</span>;
      case 'PRO':
        return <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">🟣 PRO PLAN</span>;
      case 'MAX':
        return <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">🟡 MAX PLAN</span>;
      default:
        return <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">FREE PLAN (৳০)</span>;
    }
  };

  const isFreePlanLimitUsed = user?.subscriptionPlan === 'FREE' && (user.videosCreatedCount >= (settings?.freePlanVideoLimit || 1));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Device Conflict Alert if any */}
      {deviceConflict && (
        <div className="p-4 rounded-3xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-start space-x-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-sm text-white">This subscription is already active on another device.</h4>
            <p>
              আপনার অ্যাকাউন্টটি ইতোমধ্যে অন্য একটি ডিভাইসে সক্রিয় আছে। প্রতিটি সাবস্ক্রিপশন একসাথে কেবল <b>১টি ডিভাইসে</b> চলবে। ডিভাইস পরিবর্তন করতে অ্যাডমিনের সহায়তা নিন।
            </p>
          </div>
        </div>
      )}

      {/* Announcement Banner */}
      {settings?.announcement && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/40 border border-red-500/20 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-medium">{settings.announcement}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 hidden sm:inline">
            Notice
          </span>
        </div>
      )}

      {/* Hero User Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 p-0.5 flex items-center justify-center shadow-lg">
                {user ? (
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.mobileNumber}`}
                    alt="User"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                ) : (
                  <Video className="w-7 h-7 text-red-500" />
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {user ? user.fullName : 'স্বাগতম, ক্রিয়েটর!'}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {user ? `${user.mobileNumber} · ${user.email}` : 'ভিডিও তৈরি শুরু করতে লগইন করুন'}
                </p>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user ? (
                <>
                  {getPlanBadge(user.subscriptionPlan)}
                  <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ডিভাইস: {deviceInfo.deviceLabel}</span>
                  </span>
                  {user.subscriptionExpireAt ? (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>মেয়াদ শেষ: {new Date(user.subscriptionExpireAt).toLocaleDateString('bn-BD')}</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      আজীবন ফ্রি একাউন্ট
                    </span>
                  )}
                </>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
                >
                  এখনই একাউন্ট খুলুন (১টি ফ্রি ভিডিও)
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigateTab('create')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Create Video (নতুন ভিডিও)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Free Plan Limit Notice if reached */}
      {isFreePlanLimitUsed && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>“Your free video limit has been used. Upgrade your plan to create more videos.”</span>
            </h3>
            <p className="text-xs text-slate-300">
              আপনার ফ্রি প্ল্যানের ১টি ভিডিও তৈরির লিমিট শেষ হয়েছে। আনলিমিটেড ভিডিও বানাতে GO, PLUS, PRO বা MAX প্ল্যানে আপগ্রেড করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('subscription')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition self-start sm:self-auto cursor-pointer"
          >
            Upgrade Plan Now
          </button>
        </div>
      )}

      {/* Quick Dashboard Grid Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Create Video */}
        <div
          onClick={() => onNavigateTab('create')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-red-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 text-red-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition">Create Video</h3>
            <p className="text-[11px] text-slate-400">এআই স্ক্রিপ্ট ও কনটেন্ট আইডি বাইপাস</p>
          </div>
        </div>

        {/* Card 2: My Videos */}
        <div
          onClick={() => onNavigateTab('videos')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600/15 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">My Videos</h3>
            <p className="text-[11px] text-slate-400">সংরক্ষিত ভিডিও ও ডাউনলোড</p>
          </div>
        </div>

        {/* Card 3: Subscription */}
        <div
          onClick={() => onNavigateTab('subscription')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Subscription</h3>
            <p className="text-[11px] text-slate-400">GO, PLUS, PRO, MAX প্যাকেজ</p>
          </div>
        </div>

        {/* Card 4: Payment History */}
        <div
          onClick={() => onNavigateTab('payments')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-600/15 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">Payment History</h3>
            <p className="text-[11px] text-slate-400">বিকাশ ও নগদ ট্রানজেকশন স্ট্যাটাস</p>
          </div>
        </div>

      </div>

      {/* Secondary Bottom Links & Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('profile')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Profile (প্রোফাইল)</h4>
              <p className="text-[10px] text-slate-400">ব্যক্তিগত তথ্য ও পাসওয়ার্ড</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => onNavigateTab('profile')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Device Status</h4>
              <p className="text-[10px] text-slate-400">১-ডিভাইস এনক্রিপ্টেড বাইন্ডিং</p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>

        {user ? (
          <div
            onClick={logout}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-rose-950/20 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Logout (লগআউট)</h4>
                <p className="text-[10px] text-slate-400">সেশন সমাপ্ত করুন</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
        ) : (
          <div
            onClick={onOpenAuthModal}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:bg-slate-900 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Login / Register</h4>
                <p className="text-[10px] text-slate-400">লগইন পেজে যান</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>

    </div>
  );
};
