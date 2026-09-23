import React, { useEffect, useState } from 'react';
import { Sparkles, Video, Play, Shield } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between py-12 px-6 select-none animate-in fade-in duration-300">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div />

      {/* Main Brand Logo & Tagline */}
      <div className="relative flex flex-col items-center text-center space-y-6 max-w-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-2xl shadow-red-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[22px] flex items-center justify-center">
              <Video className="w-12 h-12 text-red-500 fill-red-500/20" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-950 shadow-lg">
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white">
            FREE STUDIO
          </h1>
          <p className="text-sm font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-rose-400 uppercase">
            AI VIDEO STUDIO
          </p>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          মুভি রিক্যাপ, এআই ভিডিও রূপান্তর ও কনটেন্ট আইডি সুরক্ষিত প্রফেশনাল মোবাইল প্ল্যাটফর্ম
        </p>
      </div>

      {/* Bottom Progress & Android Security badge */}
      <div className="w-full max-w-xs space-y-4 text-center">
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>১-ডিভাইস নিরাপদ এনক্রিপ্টেড সেশন</span>
        </div>
      </div>
    </div>
  );
};
