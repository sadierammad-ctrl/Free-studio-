import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  HelpCircle,
  Lightbulb,
  FileCheck
} from 'lucide-react';
import { TransformSettings, Language, RiskAnalysis } from '../types';

interface RiskMeterProps {
  settings: TransformSettings;
  videoTitle: string;
  language: Language;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  settings,
  videoTitle,
  language,
}) => {
  const isBn = language === 'bn';
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<RiskAnalysis | null>(null);

  // Compute live local risk score based on active parameters
  let calculatedScore = 85;
  if (settings.mirror) calculatedScore -= 18;
  if (settings.speed > 1.03 || settings.speed < 0.97) calculatedScore -= 20;
  if (settings.zoom >= 5) calculatedScore -= 15;
  if (settings.filter !== 'none') calculatedScore -= 12;
  if (settings.muteOriginalAudio || settings.royaltyFreeMusicTrack !== 'none') {
    calculatedScore -= 25;
  } else if (Math.abs(settings.pitchShift) >= 1) {
    calculatedScore -= 18;
  }
  if (settings.hasBorder) calculatedScore -= 8;
  if (settings.hasDisclaimerOverlay) calculatedScore -= 7;
  if (settings.showReactionBox) calculatedScore -= 10;

  const riskScore = Math.max(5, Math.min(95, calculatedScore));

  const runAiAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/ai/analyze-fair-use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoType: 'YouTube video transformation / fair use',
          title: videoTitle,
          appliedSettings: settings,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const getRiskStatus = (score: number) => {
    if (score <= 30) {
      return {
        label: isBn ? 'নিরাপদ ফেয়ার ইউজ (Bypassed)' : 'Safe (Content ID Bypassed)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        barColor: 'from-emerald-500 to-teal-400',
        icon: ShieldCheck,
      };
    }
    if (score <= 60) {
      return {
        label: isBn ? 'মাঝারি ঝুঁকি (আরও এডিট প্রয়োজন)' : 'Moderate Risk (Add Audio/Speed Mod)',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        barColor: 'from-amber-500 to-yellow-400',
        icon: AlertTriangle,
      };
    }
    return {
      label: isBn ? 'উচ্চ ঝুঁকি (কপিরাইট ক্লেইমের সম্ভাবনা)' : 'High Risk (Claim Likely)',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      barColor: 'from-rose-600 to-red-500',
      icon: ShieldAlert,
    };
  };

  const status = getRiskStatus(riskScore);
  const StatusIcon = status.icon;

  const checklistItems = [
    {
      label: isBn ? 'ভিজ্যুয়াল ফ্রেম ইনভার্সন (মিরর/ফ্লিপ)' : 'Visual Frame Inversion (Mirror)',
      passed: settings.mirror,
      desc: isBn ? 'পিক্সেল হ্যাশ অক্ষ পরিবর্তন করে।' : 'Disrupts spatial coordinates.',
    },
    {
      label: isBn ? 'ফ্রেম টাইমিং ও স্পিড মডিফিকেশন' : 'Frame Rate & Speed Multiplier',
      passed: settings.speed > 1.03 || settings.speed < 0.97,
      desc: isBn ? 'টাইমকোড ভিত্তিক ফিঙ্গারপ্রিন্ট ফাঁকি দেয়।' : 'Prevents exact frame timing match.',
    },
    {
      label: isBn ? 'অডিও ওয়েভফর্ম পিচ শিফট বা রিপ্লেসমেন্ট' : 'Audio Pitch / Royalty-Free Swap',
      passed: settings.muteOriginalAudio || settings.royaltyFreeMusicTrack !== 'none' || Math.abs(settings.pitchShift) >= 1,
      desc: isBn ? 'অডিও কন্টেন্ট আইডি স্বয়ংক্রিয় স্ক্যান এড়িয়ে চলে।' : 'Masks acoustic fingerprint spectrum.',
    },
    {
      label: isBn ? 'কালার প্যালেট ও রেজোলিউশন জুম' : 'Color Grading & Zoom Crop',
      passed: settings.filter !== 'none' || settings.zoom >= 5,
      desc: isBn ? 'কালার হিস্টোগ্রাম ও বর্ডার ওয়াটারমার্ক পরিবর্তন করে।' : 'Alters RGB histogram & cuts borders.',
    },
    {
      label: isBn ? 'সেকশন ১০৭ ফেয়ার ইউজ লিগ্যাল ব্যানার' : 'Section 107 Fair Use Legal Banner',
      passed: settings.hasDisclaimerOverlay,
      desc: isBn ? 'আইনগত বিরোধ ও ম্যানুয়াল রিভিউতে সহায়ক।' : 'Protects against manual strikes.',
    },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col space-y-4">
      {/* Top Title & AI Audit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
          <h3 className="font-bold text-white text-sm sm:text-base">
            {isBn ? 'কপিরাইট ঝুঁকি মিটার ও অডিট' : 'Copyright Risk Meter & Audit'}
          </h3>
        </div>

        <button
          onClick={runAiAudit}
          disabled={isAuditing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white text-xs font-semibold shadow transition disabled:opacity-50"
        >
          {isAuditing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{isBn ? 'এআই ডিপ অডিট' : 'AI Deep Scan'}</span>
        </button>
      </div>

      {/* Main Score & Progress Bar */}
      <div className={`p-4 rounded-xl border ${status.bg} space-y-3`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">
              {isBn ? 'ইউটিউব কন্টেন্ট আইডি ঝুঁকি' : 'Content ID Detection Probability'}
            </span>
            <span className={`text-xl sm:text-2xl font-black ${status.color}`}>
              {riskScore}% — {status.label}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">{isBn ? 'নিরাপত্তা লেভেল' : 'Safety Score'}</span>
            <span className="text-lg font-mono font-bold text-white">
              {100 - riskScore}/100
            </span>
          </div>
        </div>

        {/* Multi-segmented Gauge */}
        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className={`h-full bg-gradient-to-r ${status.barColor} transition-all duration-500`}
            style={{ width: `${riskScore}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-emerald-400">0% (১০০% নিরাপদ)</span>
          <span className="text-amber-400">50% (মাঝারি)</span>
          <span className="text-rose-400">100% (উচ্চ ঝুঁকি)</span>
        </div>
      </div>

      {/* Content ID Checklist */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {isBn ? 'কন্টেন্ট আইডি বাইপাস চেকলিস্ট' : 'Content ID Bypass Checklist'}
        </h4>

        <div className="space-y-1.5 text-xs">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-center justify-between transition ${
                item.passed 
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300' 
                  : 'bg-rose-950/20 border-rose-900/40 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
                <div>
                  <span className={`font-medium ${item.passed ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                item.passed 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {item.passed ? (isBn ? 'সক্রিয়' : 'Passed') : (isBn ? 'প্রয়োজন' : 'Needed')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Detailed Audit Results (if generated) */}
      {aiAnalysis && (
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Lightbulb className="w-4 h-4" />
            <span>{isBn ? 'এআই বিশেষজ্ঞ পর্যালোচনা:' : 'AI Expert Recommendations:'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {aiAnalysis.summary}
          </p>

          {aiAnalysis.recommendedActions?.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {isBn ? 'পরামর্শ ও পদক্ষেপ:' : 'Actionable Advice:'}
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                {aiAnalysis.recommendedActions.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
