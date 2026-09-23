import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlanConfig, PaymentMethod } from '../types';
import { Check, Copy, AlertCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanConfig;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan }) => {
  const { user, settings, refreshUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  if (!isOpen) return null;

  const paymentNumber = paymentMethod === 'bKash' 
    ? (settings?.bkashNumber || '01835053993') 
    : (settings?.nagadNumber || '01835053993');

  const copyNumber = () => {
    navigator.clipboard.writeText(paymentNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('পেমেন্ট করার পূর্বে দয়া করে লগইন করুন।');
      return;
    }

    if (!senderNumber.trim() || !transactionId.trim()) {
      setErrorMsg('প্রেরকের নম্বর এবং ট্রানজেকশন আইডি প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
          senderNumber,
          transactionId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessSubmitted(true);
        refreshUser();
      } else {
        setErrorMsg(data.error || 'পেমেন্ট জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'নেটওয়ার্ক এরর');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-white text-base">
              পেমেন্ট সম্পন্ন করুন ({plan.name} প্ল্যান)
            </h3>
            <p className="text-[11px] text-slate-400">
              মূল্য: <span className="font-bold text-emerald-400">৳{plan.price}</span> · মেয়াদ: {plan.durationText}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">
                  পেমেন্ট সফলভাবে জমা হয়েছে!
                </h4>
                <p className="text-xs text-amber-300 font-semibold px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  “Your payment is waiting for admin verification.”
                </p>
                <p className="text-xs text-slate-400 leading-relaxed px-4">
                  অ্যাডমিন ট্রানজেকশন আইডি ({transactionId.toUpperCase()}) যাচাই করার পর আপনার <b>{plan.name}</b> সাবস্ক্রিপশনটি স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                ঠিক আছে, ড্যাশবোর্ডে ফিরুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Step 1: Select Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  ১. পেমেন্ট মাধ্যম নির্বাচন করুন (Select Method)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bKash')}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'bKash'
                        ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-md shadow-pink-600/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span>bKash (বিকাশ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                      paymentMethod === 'Nagad'
                        ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-md shadow-orange-600/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Nagad (নগদ)</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Show Number & Instructions */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    ২. সেন্ড মানি করুন (Send Money):
                  </span>
                  <span className="font-bold text-emerald-400">৳{plan.price}</span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800">
                  <div className="font-mono text-sm font-bold text-white tracking-wider">
                    {paymentNumber}
                  </div>
                  <button
                    type="button"
                    onClick={copyNumber}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 text-[11px] font-semibold transition"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  আপনার {paymentMethod} অ্যাপ থেকে উপরে দেওয়া নম্বরে <b>৳{plan.price}</b> সেন্ড মানি (Send Money) করুন।
                </p>
              </div>

              {/* Step 3: Input Sender Number & TrxID */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    ৩. প্রেরক নম্বর (Sender Number)
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন (e.g. 017xxxxxxxx)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    ৪. ট্রানজেকশন আইডি (Transaction ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TXN98765432"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition font-mono uppercase"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Important Verification Rule Notice */}
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-amber-300/90 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>গুরুত্বপূর্ণ পেমেন্ট নিয়ম:</span>
                </div>
                <p className="leading-relaxed">
                  শুধুমাত্র ট্রানজেকশন আইডি লিখলেই প্ল্যান সাথে সাথে চালু হবে না। অ্যাডমিন পেমেন্টের সত্যতা যাচাই করার পরেই সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে সক্রিয় হবে।
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <span>{loading ? 'পেমেন্ট জমা হচ্ছে...' : 'পেমেন্ট সাবমিট করুন (Submit Payment)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
