import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const isBn = language === 'bn';

  if (!isOpen) return null;

  // Real production/share URL
  const appUrl = window.location.origin;

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                {isBn ? 'মোবাইলে ইনস্টল ও লিংক' : 'Install App on Mobile'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'মোবাইল হোম স্ক্রিনে অ্যাপস হিসেবে চালান' : 'Run directly as an app on your phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* App URL Share Box */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              {isBn ? 'আপনার মোবাইলের জন্য অ্যাপ লিঙ্ক:' : 'Direct Mobile App Link:'}
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs select-all focus:outline-none"
              />
              <button
                onClick={copyUrl}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition flex-shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
                <span>{copiedLink ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {isBn 
                ? 'এই লিংকটি কপি করে আপনার ফোনের Chrome বা Safari ব্রাউজারে খুলুন।' 
                : 'Copy this link and open in your mobile Chrome or Safari browser.'}
            </p>
          </div>

          {/* Prominent Install / Add App Button */}
          <button
            onClick={async () => {
              if (isInstallable) {
                await install();
                onClose();
              } else {
                // If the browser already has the prompt or hasn't fired it, give quick tactile feedback
                const btn = document.getElementById('install-guide-box');
                btn?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center space-x-2 transition cursor-pointer active:scale-95"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span>{isInstallable 
              ? (isBn ? 'ইনস্টল অ্যাপ (Install App Now)' : 'Install App to Device') 
              : (isBn ? 'Install App (ইনস্টল নির্দেশিকা)' : 'Install App (Instructions)')}
            </span>
          </button>

          {/* Quick Notice about Chrome prompt */}
          <div id="install-guide-box" className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">💡</span>
              <span>{isBn ? '“This app cannot be installed” দেখালে:' : 'If you see "This app cannot be installed":'}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {isBn 
                ? 'ব্রাউজারে নিচে থাকা "Create shortcut" (শর্টকাট তৈরি করুন) বাটনে চাপ দিন। এটি সাথে সাথে আপনার মোবাইলের হোম স্ক্রিনে অ্যাপ আইকন বানিয়ে দিবে এবং ঠিক আসল অ্যাপের মতোই ফুল স্ক্রিনে কাজ করবে!' 
                : 'Simply tap "Create shortcut" right below in your Chrome prompt. It will place the app icon directly on your mobile home screen and open in standalone mode!'}
            </p>
          </div>

          {/* Android Guide */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">✓</span>
              <span>{isBn ? 'অ্যান্ড্রয়েড ফোন (Chrome ব্রাউজার):' : 'Android Phones (Chrome):'}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] pl-1 leading-relaxed">
              <li>{isBn ? 'নিচের পপআপে "Create shortcut" বা "Add to Home screen" চাপুন।' : 'Tap "Create shortcut" or "Add to Home screen".'}</li>
              <li>{isBn ? 'অথবা Chrome-এর ডানদিকের থ্রি-ডট (⋮) মেনুতে ক্লিক করে "Add to Home screen" চাপুন।' : 'Or tap Chrome 3-dots (⋮) and select "Add to Home screen".'}</li>
              <li>{isBn ? 'মোবাইলের হোমস্ক্রিনে অ্যাপ আইকন চলে আসবে এবং অফলাইনেও চলবে।' : 'The app icon appears on your home screen and works offline.'}</li>
            </ol>
          </div>

          {/* iPhone / iPad Guide */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs">
              <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">✓</span>
              <span>{isBn ? 'আইফোন / আইপ্যাড (Safari ব্রাউজার):' : 'iPhone / iPad (Safari):'}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] pl-1 leading-relaxed">
              <li>{isBn ? 'সাফারি (Safari) ব্রাউজারে লিংকটি খুলুন।' : 'Open the link in Safari.'}</li>
              <li>{isBn ? 'নিচে Share আইকনে (বক্স ও তীর চিহ্ন) চাপুন।' : 'Tap the Share icon at the bottom toolbar.'}</li>
              <li>{isBn ? 'স্ক্রোল করে “Add to Home Screen” সিলেক্ট করুন।' : 'Scroll and select "Add to Home Screen".'}</li>
              <li>{isBn ? 'উপরে “Add” চাপুন, সাথে সাথে অ্যাপ ইনস্টল হয়ে যাবে।' : 'Tap "Add" in top-right to finish.'}</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'অফলাইনেও কাজ করবে' : 'Fast & Offline Capable'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            {isBn ? 'ঠিক আছে' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
