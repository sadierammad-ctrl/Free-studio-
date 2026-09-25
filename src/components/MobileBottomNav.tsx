import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Sparkles, 
  Film, 
  CreditCard, 
  User, 
  Shield 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: 'dashboard' | 'create' | 'videos' | 'subscription' | 'payments' | 'profile' | 'admin';
  onNavigateTab: (tab: 'dashboard' | 'create' | 'videos' | 'subscription' | 'payments' | 'profile' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigateTab,
  onOpenAuthModal
}) => {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigateTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'dashboard'
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">হোম</span>
        </button>

        {/* 2. My Videos */}
        <button
          onClick={() => onNavigateTab('videos')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'videos'
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className={`w-5 h-5 ${currentTab === 'videos' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">মাই ভিডিও</span>
        </button>

        {/* 3. Center Special: Create Video */}
        <button
          onClick={() => onNavigateTab('create')}
          className="relative -top-3.5 flex flex-col items-center group cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-90 ${
            currentTab === 'create'
              ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white ring-4 ring-red-500/20 shadow-red-600/50'
              : 'bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-red-500/30 hover:scale-105'
          }`}>
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <span className="text-[10px] font-black text-amber-300 mt-0.5">নতুন ভিডিও</span>
        </button>

        {/* 4. Subscription / Plans */}
        <button
          onClick={() => onNavigateTab('subscription')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'subscription'
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className={`w-5 h-5 ${currentTab === 'subscription' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">প্ল্যান</span>
        </button>

        {/* 5. Profile or Login */}
        <button
          onClick={() => user ? onNavigateTab('profile') : onOpenAuthModal()}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'profile'
              ? 'text-red-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 font-medium">{user ? 'প্রোফাইল' : 'লগইন'}</span>
        </button>

      </div>
    </nav>
  );
};
