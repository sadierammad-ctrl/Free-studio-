import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlanConfig, PlanId } from '../types';
import { Check, ShieldCheck, Sparkles, Smartphone, ArrowRight, Zap, Award, Crown, Star } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface SubscriptionViewProps {
  onBack?: () => void;
  onPlanSelected?: (plan: PlanConfig) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onBack, onPlanSelected }) => {
  const { user, plans, settings } = useAuth();
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PlanConfig | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleBuyNow = (plan: PlanConfig) => {
    if (onPlanSelected) {
      onPlanSelected(plan);
    }
    setSelectedPlanForPayment(plan);
    setIsPaymentModalOpen(true);
  };

  const getPlanVisuals = (id: PlanId) => {
    switch (id) {
      case 'GO':
        return {
          icon: Zap,
          colorBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          gradientBorder: 'from-emerald-500/50 to-teal-500/20',
          accentColor: 'text-emerald-400',
          btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30',
          badgeText: '🟢 GO',
        };
      case 'PLUS':
        return {
          icon: Star,
          colorBadge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          gradientBorder: 'from-blue-500/50 to-indigo-500/20',
          accentColor: 'text-blue-400',
          btnGradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30',
          badgeText: '🔵 PLUS',
        };
      case 'PRO':
        return {
          icon: Award,
          colorBadge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          gradientBorder: 'from-purple-500/50 to-pink-500/20',
          accentColor: 'text-purple-400',
          btnGradient: 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30',
          badgeText: '🟣 PRO (সর্বাধিক জনপ্রিয়)',
        };
      case 'MAX':
        return {
          icon: Crown,
          colorBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          gradientBorder: 'from-amber-500/60 to-orange-500/30',
          accentColor: 'text-amber-400',
          btnGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30',
          badgeText: '🟡 MAX (মেগা ভিআইপি)',
        };
      default:
        return {
          icon: Sparkles,
          colorBadge: 'bg-slate-700/50 text-slate-300 border-slate-700',
          gradientBorder: 'from-slate-700 to-slate-800',
          accentColor: 'text-slate-300',
          btnGradient: 'from-slate-700 to-slate-800',
          badgeText: 'FREE',
        };
    }
  };

  const premiumPlans = plans.filter(p => p.id !== 'FREE');
  const freePlan = plans.find(p => p.id === 'FREE');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>প্রিমিয়াম এআই সাবস্ক্রিপশন ও আনলিমিটেড ভিডিও মেকিং</span>
        </div>
        
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          আপনার পছন্দের প্ল্যানটি বেছে নিন
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          বিকাশ বা নগদ-এর মাধ্যমে নিরাপদে পেমেন্ট করুন। প্রতিটি প্ল্যান ১টি নির্দিষ্ট অনুমোদিত ডিভাইসে এনক্রিপ্টেড ও সম্পূর্ণ নিরাপদ।
        </p>

        {/* Current status chip */}
        {user && (
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span>বর্তমান প্ল্যান:</span>
            <span className="font-bold text-white px-2 py-0.5 rounded-md bg-slate-800">
              {user.subscriptionPlan} PLAN
            </span>
            {user.subscriptionExpireAt && (
              <span className="text-[11px] text-slate-400">
                (মেয়াদ: {new Date(user.subscriptionExpireAt).toLocaleDateString('bn-BD')} পর্যন্ত)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Free Plan Information Card if on Free Plan */}
      {freePlan && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                FREE PLAN
              </span>
              <span className="text-sm font-bold text-white">৳০ / ১টি ফ্রি ভিডিও</span>
            </div>
            <p className="text-xs text-slate-400">
              প্রত্যেক নতুন অ্যাকাউন্ট পায় ১টি সম্পূর্ণ ফ্রি ভিডিও তৈরির সুযোগ। ফ্রি লিমিট শেষ হলে নিচের যেকোনো প্যাকেজ আপগ্রেড করুন।
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center space-x-2 flex-shrink-0">
            <span className="font-semibold text-slate-300">ব্যবহার হয়েছে:</span>
            <span className="px-2 py-1 bg-slate-800 rounded-lg text-amber-400 font-mono font-bold">
              {user?.videosCreatedCount || 0} / {settings?.freePlanVideoLimit || 1} ভিডিও
            </span>
          </div>
        </div>
      )}

      {/* 4 Premium Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {premiumPlans.map((plan) => {
          const visual = getPlanVisuals(plan.id);
          const Icon = visual.icon;
          const isCurrent = user?.subscriptionPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-slate-900/90 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1 ${
                plan.id === 'PRO'
                  ? 'border-purple-500/60 shadow-purple-900/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Accent Strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${visual.btnGradient}`} />

              <div className="p-5 sm:p-6 space-y-5 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${visual.colorBadge}`}>
                      {visual.badgeText}
                    </span>
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <Icon className={`w-5 h-5 ${visual.accentColor}`} />
                  </div>
                </div>

                {/* Price & Duration */}
                <div className="space-y-1 pb-3 border-b border-slate-800/80">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-white">৳{plan.price}</span>
                    <span className="text-xs text-slate-400">/ {plan.durationText}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {plan.tagline}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    ফিচারসমূহ:
                  </span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className={`w-2.5 h-2.5 ${visual.accentColor}`} />
                      </div>
                      <span className="leading-snug text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 sm:p-6 pt-0 bg-slate-900/60">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center space-x-2 cursor-default border border-slate-700"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>বর্তমান সক্রিয় প্ল্যান</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuyNow(plan)}
                    className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${visual.btnGradient} text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95`}
                  >
                    <span>Buy Now (সাবস্ক্রাইব করুন)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 1 Subscription = 1 Device & Security Guarantee Banner */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">১ সাবস্ক্রিপশন = ১ ডিভাইস</h4>
            <p className="text-[11px] text-slate-400">প্রতিটি অ্যাকাউন্ট ১টি নির্দিষ্ট অনুমোদিত ফোনে সক্রিয় থাকে।</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">অ্যাডমিন সুরক্ষিত পেমেন্ট</h4>
            <p className="text-[11px] text-slate-400">বিকাশ ও নগদ ট্রানজেকশন যাচাইয়ের পর স্বয়ংক্রিয় এক্টিভেশন।</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">দ্রুততম এআই রেন্ডারিং</h4>
            <p className="text-[11px] text-slate-400">কনটেন্ট আইডি বাইপাস ও ফুল এইচডি ভিডিও এক্সপোর্ট সুবিধা।</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlanForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlanForPayment}
        />
      )}
    </div>
  );
};
