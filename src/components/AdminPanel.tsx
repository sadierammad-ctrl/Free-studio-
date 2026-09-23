import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, CreditCard, Shield, Settings, CheckCircle2, XCircle, RefreshCw, 
  Search, Smartphone, Edit, Trash2, Key, Sliders, ToggleLeft, ToggleRight, Sparkles, DollarSign
} from 'lucide-react';
import { AppUser, PaymentRecord, PlanConfig, AppSettings } from '../types';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'payments' | 'plans' | 'settings'>('dashboard');

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [plansList, setPlansList] = useState<PlanConfig[]>([]);
  const [settingsData, setSettingsData] = useState<AppSettings | null>(null);

  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Fetch admin dashboard overview
  const fetchAllData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const headers = { 'x-user-id': user.id };
      
      const [resStats, resUsers, resPayments, resPlans, resSettings] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json()),
        fetch('/api/admin/payments', { headers }).then(r => r.json()),
        fetch('/api/admin/plans', { headers }).then(r => r.json()),
        fetch('/api/admin/settings', { headers }).then(r => r.json()),
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resUsers.success) setUsersList(resUsers.users);
      if (resPayments.success) setPaymentsList(resPayments.payments);
      if (resPlans.success) setPlansList(resPlans.plans);
      if (resSettings.success) setSettingsData(resSettings.settings);
    } catch (e: any) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.id]);

  // Payment Approve/Reject Action
  const handleVerifyPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    const note = prompt(action === 'approve' ? 'অ্যাডমিন নোট (ঐচ্ছিক):' : 'বাতিল করার কারণ লিখুন:');
    if (action === 'reject' && note === null) return;

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ action, adminNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message);
        fetchAllData();
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // User Actions (reset device, suspend, change sub)
  const handleUserAction = async (targetUserId: string, action: string, payload?: any) => {
    if (!user) return;
    if (action === 'delete' && !confirm('আপনি কি নিশ্চিত যে এই ব্যবহারকারীকে স্থায়ীভাবে মুছতে চান?')) return;

    try {
      const res = await fetch(`/api/admin/users/${targetUserId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message);
        fetchAllData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !settingsData) return;
    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ settings: settingsData }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg('অ্যাপ সেটিংস সফলভাবে আপডেট হয়েছে!');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Update Plans
  const handleSavePlans = async () => {
    if (!user || !plansList) return;
    try {
      const res = await fetch('/api/admin/plans/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ plans: plansList }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg('প্ল্যানের মূল্য ও সেটিংস ডাটাবেজে আপডেট হয়েছে!');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.mobileNumber.includes(searchUser) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
              Super Admin Control
            </span>
            <span className="text-xs text-slate-400 font-mono">01835053993</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            FREE STUDIO — অ্যাডমিন প্যানেল
          </h2>
          <p className="text-xs text-slate-400">
            ব্যবহারকারী ব্যবস্থাপনা, বিকাশ/নগদ পেমেন্ট ভেরিফিকেশন, ১-ডিভাইস রিসেট এবং প্ল্যান কন্ট্রোল
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center space-x-2 self-start sm:self-auto transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ ডেটা</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ড্যাশবোর্ড (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'payments' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>পেমেন্ট ভেরিফিকেশন</span>
          {stats?.pendingPayments > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              {stats.pendingPayments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'users' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>ইউজার ও ডিভাইস</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'plans' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>প্ল্যান কন্ট্রোল (Database)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>অ্যাপ সেটিংস</span>
        </button>
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">মোট ব্যবহারকারী</span>
              <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
              <span className="text-[11px] text-emerald-400 font-semibold">{stats.activeUsers} সক্রিয়</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">অপেক্ষমাণ পেমেন্ট</span>
              <div className="text-2xl font-black text-amber-400">{stats.pendingPayments}</div>
              <span className="text-[11px] text-slate-500">ভেরিফিকেশনের জন্য বাকি</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">মোট সংগৃহীত আয়</span>
              <div className="text-2xl font-black text-emerald-400">৳{stats.totalRevenue}</div>
              <span className="text-[11px] text-slate-500">{stats.approvedPayments} টি অনুমোদিত</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">১-ডিভাইস অ্যাক্টিভ</span>
              <div className="text-2xl font-black text-purple-400">{stats.activeDevices}</div>
              <span className="text-[11px] text-slate-500">অনুমোদিত হার্ডওয়্যার</span>
            </div>
          </div>

          {/* Breakdown by Subscription Plan */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>প্ল্যান ভিত্তিক ব্যবহারকারী অনুপাত:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">FREE Users</span>
                <span className="text-lg font-black text-white">{stats.freeUsers}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-emerald-400 block">🟢 GO Users</span>
                <span className="text-lg font-black text-emerald-400">{stats.goUsers}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-blue-400 block">🔵 PLUS Users</span>
                <span className="text-lg font-black text-blue-400">{stats.plusUsers}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-purple-400 block">🟣 PRO Users</span>
                <span className="text-lg font-black text-purple-400">{stats.proUsers}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-amber-400 block">🟡 MAX Users</span>
                <span className="text-lg font-black text-amber-400">{stats.maxUsers}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PAYMENT VERIFICATION */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">বিকাশ ও নগদ পেমেন্ট তালিকা</h3>
            <span className="text-xs text-slate-400">মোট: {paymentsList.length} টি</span>
          </div>

          <div className="space-y-3">
            {paymentsList.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{p.userName}</span>
                    <span className="text-xs text-slate-400">({p.userMobile})</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-bold text-amber-400">
                      {p.planName}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">৳{p.amount}</span>
                  </div>

                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                    <span>মেথড: <b className="text-white">{p.paymentMethod}</b></span>
                    <span>প্রেরক নম্বর: <b className="text-white">{p.senderNumber}</b></span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-300 font-bold">
                      TrxID: {p.transactionId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans">
                      {new Date(p.createdAt).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {p.adminNote && (
                    <p className="text-[11px] text-slate-400 italic">অ্যাডমিন নোট: {p.adminNote}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {p.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleVerifyPayment(p.id, 'approve')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>APPROVE (অনুমোদন)</span>
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(p.id, 'reject')}
                        className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs transition flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>REJECT (বাতিল)</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      p.status === 'approved' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. USER MANAGEMENT & DEVICE RESET */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 transition"
              />
            </div>
            <span className="text-xs text-slate-400">মোট ইউজার: {filteredUsers.length} জন</span>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{u.fullName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                      {u.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                      {u.subscriptionPlan} PLAN
                    </span>
                    {u.isSuspended && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                        SUSPENDED
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                    <span>📱 {u.mobileNumber}</span>
                    <span>✉️ {u.email}</span>
                    <span className="text-emerald-400">ভিডিও তৈরি: {u.videosCreatedCount} টি</span>
                  </div>

                  {/* Device Info */}
                  <div className="pt-1 text-[11px] text-slate-400 flex items-center space-x-2">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      সক্রিয় ডিভাইস: <b className="text-white">{u.activeDeviceId ? (u.deviceLabel || u.activeDeviceId) : 'কোনো ডিভাইস বাইন্ড নেই'}</b>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {u.activeDeviceId && (
                    <button
                      onClick={() => handleUserAction(u.id, 'reset_device')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/30 transition cursor-pointer"
                      title="১-ডিভাইস আনবাইন্ড করুন"
                    >
                      ডিভাইস রিসেট
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const newPlan = prompt('নতুন প্ল্যান নির্বাচন করুন (FREE, GO, PLUS, PRO, MAX):', u.subscriptionPlan);
                      if (newPlan) handleUserAction(u.id, 'change_subscription', { planId: newPlan.toUpperCase() });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition"
                  >
                    প্ল্যান পরিবর্তন
                  </button>

                  <button
                    onClick={() => {
                      const days = prompt('কত দিন বাড়াতে চান?', '30');
                      if (days) handleUserAction(u.id, 'extend_subscription', { days });
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition"
                  >
                    মেয়াদ বৃদ্ধি
                  </button>

                  <button
                    onClick={() => handleUserAction(u.id, u.isSuspended ? 'activate' : 'suspend')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                      u.isSuspended ? 'bg-emerald-600 text-white' : 'bg-rose-600/20 text-rose-400'
                    }`}
                  >
                    {u.isSuspended ? 'আন-সাসপেন্ড' : 'সাসপেন্ড'}
                  </button>

                  <button
                    onClick={() => handleUserAction(u.id, 'delete')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                    title="ডিলিট"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PLAN CONTROL (STORED IN DB) */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">প্ল্যান কন্ট্রোল ও প্রাইসিং (Database Driven)</h3>
              <p className="text-xs text-slate-400">হার্ডকোড নয়, ডাটাবেজ থেকে সরাসরি প্ল্যানের মূল্য ও ফিচার পরিবর্তন করুন।</p>
            </div>
            <button
              onClick={handleSavePlans}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              সংরক্ষণ করুন (Save Plans)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plansList.map((plan, index) => (
              <div key={plan.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">{plan.name}</span>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={plan.isAvailable}
                      onChange={(e) => {
                        const updated = [...plansList];
                        updated[index].isAvailable = e.target.checked;
                        setPlansList(updated);
                      }}
                      className="rounded"
                    />
                    <span>সক্রিয় রাখুন</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">মূল্য (৳ BDT)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => {
                        const updated = [...plansList];
                        updated[index].price = Number(e.target.value);
                        setPlansList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">মেয়াদ (দিন)</label>
                    <input
                      type="number"
                      value={plan.durationDays}
                      onChange={(e) => {
                        const updated = [...plansList];
                        updated[index].durationDays = Number(e.target.value);
                        setPlansList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ট্যাগলাইন / বর্ণনা</label>
                  <input
                    type="text"
                    value={plan.tagline}
                    onChange={(e) => {
                      const updated = [...plansList];
                      updated[index].tagline = e.target.value;
                      setPlansList(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. APP SETTINGS */}
      {activeTab === 'settings' && settingsData && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">অ্যাপ সেটিংস ও সুইচেস</h3>
              <p className="text-xs text-slate-400">বিকাশ/নগদ নাম্বার ও মেথড কন্ট্রোল</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer"
            >
              সেটিংস সেভ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                বিকাশ নম্বর (bKash Number)
              </label>
              <input
                type="text"
                value={settingsData.bkashNumber}
                onChange={(e) => setSettingsData({ ...settingsData, bkashNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                নগদ নম্বর (Nagad Number)
              </label>
              <input
                type="text"
                value={settingsData.nagadNumber}
                onChange={(e) => setSettingsData({ ...settingsData, nagadNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              অ্যাপ অ্যানাউন্সমেন্ট ব্যানার (Announcement)
            </label>
            <textarea
              rows={2}
              value={settingsData.announcement}
              onChange={(e) => setSettingsData({ ...settingsData, announcement: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white font-semibold">bKash পেমেন্ট গেটওয়ে সক্রিয়</span>
              <input
                type="checkbox"
                checked={settingsData.isBkashActive}
                onChange={(e) => setSettingsData({ ...settingsData, isBkashActive: e.target.checked })}
                className="rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white font-semibold">Nagad পেমেন্ট গেটওয়ে সক্রিয়</span>
              <input
                type="checkbox"
                checked={settingsData.isNagadActive}
                onChange={(e) => setSettingsData({ ...settingsData, isNagadActive: e.target.checked })}
                className="rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white font-semibold">নতুন রেজিস্ট্রেশন চালু</span>
              <input
                type="checkbox"
                checked={settingsData.isRegistrationOpen}
                onChange={(e) => setSettingsData({ ...settingsData, isRegistrationOpen: e.target.checked })}
                className="rounded"
              />
            </label>

            <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-xs text-white font-semibold">মেইনটেন্যান্স মোড (Maintenance Mode)</span>
              <input
                type="checkbox"
                checked={settingsData.isMaintenanceMode}
                onChange={(e) => setSettingsData({ ...settingsData, isMaintenanceMode: e.target.checked })}
                className="rounded"
              />
            </label>
          </div>
        </form>
      )}

    </div>
  );
};
