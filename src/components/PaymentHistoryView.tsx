import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentRecord } from '../types';
import { Clock, CheckCircle2, XCircle, CreditCard, RefreshCw } from 'lucide-react';

export const PaymentHistoryView: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/my-history', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved (অনুমোদিত)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Rejected (বাতিল)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Pending (অপেক্ষমাণ)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">পেমেন্ট ইতিহাস (Payment History)</h2>
          <p className="text-xs text-slate-400">আপনার সমস্ত বিকাশ ও নগদ পেমেন্ট রিকোয়েস্টের রিয়েল-টাইম স্ট্যাটাস</p>
        </div>
        <button
          onClick={fetchPayments}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">লোড হচ্ছে...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">কোনো পেমেন্ট রেকর্ড নেই</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            আপনি এখনও কোনো সাবস্ক্রিপশন প্ল্যানের জন্য পেমেন্ট সাবমিট করেননি।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-sm">{p.planName}</span>
                  <span className="text-xs font-bold text-emerald-400">৳{p.amount}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                    {p.paymentMethod}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                  <span>TrxID: <b className="text-slate-200">{p.transactionId}</b></span>
                  <span>প্রেরক: <b>{p.senderNumber}</b></span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    {new Date(p.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                {p.adminNote && (
                  <p className="text-[11px] text-slate-400 pt-1 italic">
                    নোট: {p.adminNote}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {getStatusBadge(p.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
