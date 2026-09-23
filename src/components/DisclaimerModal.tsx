import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Send,
  Sparkles 
} from 'lucide-react';
import { Language } from '../types';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  language: Language;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  language,
}) => {
  const isBn = language === 'bn';

  const [channelName, setChannelName] = useState<string>('My Channel');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'dispute' | 'tags'>('disclaimer');

  if (!isOpen) return null;

  const enDisclaimer = `--- COPYRIGHT DISCLAIMER UNDER SECTION 107 OF THE COPYRIGHT ACT 1976 ---
Copyright Disclaimer Under Section 107 of the Copyright Act 1976, allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship, education and research.

Fair use is a use permitted by copyright statute that might otherwise be infringing. Non-profit, educational or personal use tips the balance in favor of fair use.

Video Title: ${videoTitle || 'Transformed Clip'}
Channel: ${channelName}
All rights belong to their respective owners. No copyright infringement intended.
If you are the legal content owner and wish for this material to be modified or removed, please contact us directly.`;

  const bnDisclaimer = `--- কপিরাইট আইন ১৯৭৬ এর ধারা ১০৭ এর অধীনে ফেয়ার ইউজ বিজ্ঞপ্তি ---
১৯৭৬ সালের কপিরাইট আইনের ধারা ১০৭-এর অধীনে, সমালোচনা, পর্যালোচনা, মন্তব্য, সংবাদ প্রতিবেদন, শিক্ষাদান, বৃত্তি এবং গবেষণার মতো উদ্দেশ্যে "ন্যায্য ব্যবহার" (Fair Use) এর বিধান রয়েছে।

ফেয়ার ইউজ হলো এমন একটি আইনগত ব্যবহার যা কপিরাইট আইন দ্বারা অনুমোদিত যা অন্যথায় লঙ্ঘন হিসেবে বিবেচিত হতে পারত। অলাভজনক, শিক্ষামূলক বা ব্যক্তিগত ব্যবহারের ক্ষেত্রে ফেয়ার ইউজ এর প্রাধান্য দেওয়া হয়।

ভিডিও শিরোনাম: ${videoTitle || 'রূপান্তরিত ভিডিও'}
চ্যানেল নাম: ${channelName}
সকল স্বত্ব মূল স্বত্বাধিকারীর সংরক্ষিত। কোনো কপিরাইট লঙ্ঘনের উদ্দেশ্য নেই।
যদি আপনি মূল কপিরাইট মালিক হন এবং এটি অপসারণ করতে চান, অনুগ্রহ করে সরাসরি আমাদের সাথে যোগাযোগ করুন।`;

  const disputeLetter = `To the YouTube Copyright & Content ID Review Team:

I am writing to submit an official Fair Use dispute regarding the Content ID claim on my video "${videoTitle}".

This video represents a transformative work protected under Section 107 of the U.S. Copyright Act (Fair Use Doctrine) for the following reasons:
1. Purpose & Character: The material is utilized for critical commentary, review, education, and creative transformation rather than mere reproduction.
2. Transformative Modification: Significant visual modifications (color grading, reframing, speed/timing variation) and original commentary/audio mixing have been applied to add new meaning and message.
3. Market Substitution: This video does not substitute or compete with the original broadcast or commercial value of the rights holder's work.

In accordance with YouTube policy and federal copyright standards, I kindly request that you release this claim immediately.

Sincerely,
${channelName}`;

  const recommendedTags = `#FairUse #VideoReview #Commentary #EducationalReview #Transformative #FairUseAct #NoCopyrightInfringement #Reels #${videoTitle.replace(/[^a-zA-Z0-9]/g, '')}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isBn ? 'ইউটিউব ফেয়ার ইউজ ডিসক্লেইমার ও ডিসপিউট কিট' : 'YouTube Fair Use & Dispute Appeal Kit'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? 'ডেসক্রিপশন বক্স ও কপিরাইট বিরোধের জন্য আইনি টেক্সট' : 'Official legal notices for YouTube descriptions & dispute forms'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Name Input */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center space-x-3 text-xs">
          <span className="text-slate-400 font-medium">
            {isBn ? 'আপনার চ্যানেল নাম:' : 'Your Channel Name:'}
          </span>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:ring-1 focus:ring-red-500 flex-1"
          />
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              activeTab === 'disclaimer'
                ? 'border-red-500 text-white bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? '১. ডেসক্রিপশন ডিসক্লেইমার' : '1. Description Notice'}
          </button>
          <button
            onClick={() => setActiveTab('dispute')}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              activeTab === 'dispute'
                ? 'border-red-500 text-white bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? '২. কন্টেন্ট আইডি ডিসপিউট লেটার' : '2. Dispute Appeal Letter'}
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 py-2.5 text-center transition border-b-2 ${
              activeTab === 'tags'
                ? 'border-red-500 text-white bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isBn ? '৩. নিরাপদ হ্যাশট্যাগ' : '3. Safe Tags'}
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {isBn ? 'ইংরেজি সংস্করণ (ইউটিউবের স্ট্যান্ডার্ড)' : 'English Version (Global Standard)'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(enDisclaimer, 'en')}
                    className="flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
                  >
                    {copiedType === 'en' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'en' ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি করুন' : 'Copy')}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={enDisclaimer}
                  rows={6}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {isBn ? 'বাংলা সংস্করণ' : 'Bengali Version'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(bnDisclaimer, 'bn')}
                    className="flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
                  >
                    {copiedType === 'bn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'bn' ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি করুন' : 'Copy')}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={bnDisclaimer}
                  rows={6}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'dispute' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-2.5 text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {isBn 
                    ? 'যদি ইউটিউবের কোনো বট ভুলবশত কন্টেন্ট আইডি ক্লেইম দেয়, তাহলে ইউটিউব স্টুডিওর "Dispute Claim" অপশনে গিয়ে এই আপিলটি পেস্ট করুন।'
                    : 'If an automated Content ID bot flags your transformed clip, paste this official Fair Use statement in YouTube Studio.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-300">
                  {isBn ? 'অফিসিয়াল আপিল স্ক্রিপ্ট' : 'Official Appeal Response Script'}
                </span>
                <button
                  onClick={() => copyToClipboard(disputeLetter, 'dispute')}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white transition font-medium"
                >
                  {copiedType === 'dispute' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'dispute' ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'সম্পূর্ণ আপিল কপি করুন' : 'Copy Dispute Letter')}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={disputeLetter}
                rows={9}
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed resize-none focus:outline-none"
              />
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-3">
              <span className="font-semibold text-slate-300 block">
                {isBn ? 'ভিডিও আপলোডের জন্য প্রস্তাবিত হ্যাশট্যাগ' : 'Recommended YouTube Tags'}
              </span>
              <p className="text-slate-400 text-[11px]">
                {isBn 
                  ? 'এই ট্যাগগুলো ইউটিউব অ্যালগরিদমকে বোঝায় যে ভিডিওটি সমালোচনামূলক বা ফেয়ার ইউজ পর্যালোচনার জন্য তৈরি।'
                  : 'These tags help YouTube categorization recognize your video as an educational review.'}
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-mono text-emerald-400 text-xs">{recommendedTags}</span>
                <button
                  onClick={() => copyToClipboard(recommendedTags, 'tags')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                >
                  {copiedType === 'tags' ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি' : 'Copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
