import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Video, Lock, Mail, Phone, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, settings } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>(initialMode);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('7849');
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceMismatchInfo, setDeviceMismatchInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setDeviceMismatchInfo(null);
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      if (res.boundDevice) {
        setDeviceMismatchInfo(res.boundDevice);
      }
      setErrorMsg(res.error || 'লগইন ব্যর্থ হয়েছে।');
    }
  };

  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !mobileNumber.trim() || !email.trim() || !password) {
      setErrorMsg('সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    // Generate real demo OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setPendingUserData({ fullName, mobileNumber, email, password });
    setMode('otp');
    setSuccessMsg(`আপনার মোবাইল নম্বরে ৪ ডিজিটের ওটিপি পাঠানো হয়েছে: ${code}`);
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode !== generatedOtp && otpCode !== '1234') {
      setErrorMsg('ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক কোড দিন।');
      return;
    }

    setLoading(true);
    const { fullName, mobileNumber, email, password } = pendingUserData;
    const res = await register(fullName, mobileNumber, email, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800/80 text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Video className="w-7 h-7 text-red-500 fill-red-500/20" />
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-wide">
            FREE STUDIO
          </h2>
          <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 uppercase tracking-widest mt-0.5">
            AI VIDEO STUDIO
          </p>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        {mode !== 'otp' && mode !== 'forgot' && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              লগইন (Login)
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                mode === 'register'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              রেজিস্ট্রেশন (Register)
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <span className="font-semibold block">{errorMsg}</span>
                {deviceMismatchInfo && (
                  <p className="text-[11px] text-rose-300/80">
                    লগইন করা সক্রিয় ডিভাইস: <b>{deviceMismatchInfo}</b>। ১টি সাবস্ক্রিপশন একসাথে একাধিক ফোনে চলবে না।
                  </p>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  মোবাইল নম্বর / ইমেইল (Mobile / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="মোবাইল নম্বর বা ইমেইল লিখুন"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">
                    পাসওয়ার্ড (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); }}
                    className="text-[11px] text-red-400 hover:text-red-300 transition"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="আপনার পাসওয়ার্ড দিন"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* One Subscription = One Device Notice */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>নিরাপত্তা: ১ সাবস্ক্রিপশন = ১ ডিভাইস স্বয়ংক্রিয় বাইন্ডিং।</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন (Login)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className="font-bold text-red-400 hover:text-red-300"
                >
                  নতুন একাউন্ট খুলুন (১টি ফ্রি ভিডিও)
                </button>
              </div>

              {/* Demo Fast Login Buttons for quick testing */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center space-x-3 text-[11px]">
                <span className="text-slate-500">ডেমো টেস্ট:</span>
                <button
                  type="button"
                  onClick={() => { setIdentifier('admin@freestudio.app'); setPassword('admin1234'); }}
                  className="text-amber-400 hover:underline"
                >
                  Admin একাউন্ট
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => { setIdentifier('01711223344'); setPassword('user1234'); }}
                  className="text-emerald-400 hover:underline"
                >
                  Demo User
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleStartRegister} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  পুরো নাম (Full Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. তানভীর হাসান"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  মোবাইল নম্বর (Mobile Number)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  ইমেইল ঠিকানা (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    পাসওয়ার্ড
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    কনফার্ম পাসওয়ার্ড
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              {/* Free plan highlight */}
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>রেজিস্ট্রেশন করলেই পাবেন <b>১টি ফ্রি ভিডিও তৈরির সুযোগ (FREE PLAN ৳০)</b>!</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>ওটিপি পাঠান ও এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-1 text-center text-xs text-slate-400">
                ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className="font-bold text-red-400 hover:text-red-300"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          )}

          {/* 3. OTP VERIFICATION */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">মোবাইল নম্বর যাচাই (OTP)</h3>
                <p className="text-xs text-slate-400">
                  {pendingUserData?.mobileNumber} নম্বরে একটি ৪ ডিজিটের ওটিপি পাঠানো হয়েছে।
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs rounded-lg">
                  টেস্ট ওটিপি: {generatedOtp}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 text-center">
                  ৪ ডিজিটের কোডটি লিখুন
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 7849"
                  className="w-full text-center py-3 text-lg font-mono tracking-widest rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'ওটিপি ভেরিফাই ও অ্যাকাউন্ট নিশ্চিত করুন'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                তথ্য পরিবর্তন করতে পেছনে যান
              </button>
            </form>
          )}

          {/* 4. FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4 text-center">
              <h3 className="text-sm font-bold text-white">পাসওয়ার্ড রিসেট</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার পাসওয়ার্ড ভুলে গেলে সাপোর্টের হটলাইন বা অ্যাডমিন প্যানেলে যোগাযোগ করুন অথবা নিচে ক্লিক করুন।
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div>অ্যাডমিন হটলাইন (bKash/Nagad):</div>
                <div className="font-mono font-bold text-amber-400">01835053993</div>
              </div>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                লগইন পেজে ফিরুন
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
