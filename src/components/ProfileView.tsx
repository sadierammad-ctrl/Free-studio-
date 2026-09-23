import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Smartphone, Shield, Calendar, KeyRound, Check, LogOut, Sparkles, Video } from 'lucide-react';

interface ProfileViewProps {
  onGoToSubscription: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onGoToSubscription }) => {
  const { user, logout, deviceInfo, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          email,
          newPassword: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
        setIsEditing(false);
        refreshUser();
      }
    } catch (e: any) {
      setLoading(false);
      setMsg(e.message || 'Error updating');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
        <div className="relative">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.mobileNumber}`}
            alt={user.fullName}
            className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-700 object-cover shadow-lg"
          />
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white shadow">
            {user.subscriptionPlan}
          </span>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white">{user.fullName}</h2>
              <p className="text-xs text-slate-400 font-mono">{user.email} · {user.mobileNumber}</p>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700 self-center sm:self-start cursor-pointer"
            >
              {isEditing ? 'বাতিল করুন' : 'প্রোফাইল এডিট'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>প্ল্যান: {user.subscriptionPlan}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center space-x-1">
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>তৈরিকৃত ভিডিও: {user.videosCreatedCount} টি</span>
            </span>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
          {msg}
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white">তথ্য আপডেট করুন</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">পুরো নাম</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">মোবাইল নম্বর</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
              <input
                type="password"
                placeholder="নতুন পাসওয়ার্ড দিন"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </button>
        </form>
      )}

      {/* Subscription & Device Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Subscription Info */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>সাবস্ক্রিপশন বিস্তারিত</span>
            </span>
            <button
              onClick={onGoToSubscription}
              className="text-xs text-red-400 hover:underline font-bold"
            >
              আপগ্রেড করুন
            </button>
          </div>
          
          <div className="space-y-1.5 text-xs text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>প্ল্যানের ধরন:</span>
              <span className="font-bold text-white">{user.subscriptionPlan}</span>
            </div>
            <div className="flex justify-between">
              <span>শুরুর তারিখ:</span>
              <span className="text-slate-300">
                {user.subscriptionStartAt ? new Date(user.subscriptionStartAt).toLocaleDateString('bn-BD') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>মেয়াদ শেষ:</span>
              <span className="text-slate-300">
                {user.subscriptionExpireAt ? new Date(user.subscriptionExpireAt).toLocaleDateString('bn-BD') : 'আজীবন'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ভিডিও তৈরির সীমা:</span>
              <span className="text-emerald-400 font-bold">
                {user.subscriptionPlan === 'FREE' ? `${user.videosCreatedCount} / 1 ভিডিও (ফ্রি)` : 'আনলিমিটেড ভিডিও'}
              </span>
            </div>
          </div>
        </div>

        {/* 1-Device Binding Info */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>ডিভাইস স্ট্যাটাস (১-ডিভাইস)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Active Bound
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>বর্তমান ডিভাইস:</span>
              <span className="font-medium text-white truncate max-w-[150px]">
                {deviceInfo.deviceLabel}
              </span>
            </div>
            <div className="flex justify-between font-mono text-[11px]">
              <span>ডিভাইস আইডি:</span>
              <span className="text-slate-300 truncate max-w-[150px]">{deviceInfo.deviceId}</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-snug">
              🔒 এই অ্যাকাউন্টটি শুধুমাত্র আপনার বর্তমান এই ডিভাইসে অনুমোদিত। নতুন ফোনে চালাতে চাইলে অ্যাডমিনের সহায়তা নিয়ে ডিভাইস রিসেট করতে হবে।
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-2xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition flex items-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>লগআউট করুন (Logout)</span>
        </button>
      </div>

    </div>
  );
};
