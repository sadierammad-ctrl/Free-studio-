import React from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Youtube,
  DollarSign
} from 'lucide-react';
import { Language } from '../types';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isBn = language === 'bn';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isBn 
                  ? 'ইউটিউব কপিরাইট ও ফেয়ার ইউজ মাস্টার গাইডলাইন' 
                  : 'YouTube Copyright & Fair Use Master Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn 
                  ? 'কীভাবে কোনো স্ট্রাইক ছাড়াই যে কোনো ভিডিও আইনগতভাবে ব্যবহার করবেন' 
                  : 'How to legally transform and monetize any video without strikes'}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: How Content ID works */}
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Youtube className="w-4 h-4" />
              <span>{isBn ? '১. ইউটিউব কন্টেন্ট আইডি (Content ID) কীভাবে কাজ করে?' : '1. How YouTube Content ID Actually Works'}</span>
            </div>
            <p>
              {isBn 
                ? 'ইউটিউব দুটি প্রধান প্রযুক্তির মাধ্যমে কপিরাইটযুক্ত কন্টেন্ট শনাক্ত করে:' 
                : 'YouTube scans uploaded media using two primary automated detection systems:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-semibold text-rose-400 block mb-1">
                  {isBn ? 'অডিও ফিঙ্গারপ্রিন্ট (Audio Fingerprint):' : 'Audio Waveform Fingerprint:'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isBn 
                    ? 'গান বা সংলাপের ফ্রিকোয়েন্সি ওয়েভফর্ম স্ক্যান করে। আমাদের অ্যাপের অডিও পিচ শিফটিং (+১ সেমিটোন) বা রয়্যালটি-ফ্রি অডিও সোয়াপ এই ট্র্যাকার নিষ্ক্রিয় করে দেয়।' 
                    : 'Scans acoustic frequency peaks. Our pitch shifter (+1 semitone) or royalty-free audio swap neutralizes this automated bot.'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="font-semibold text-cyan-400 block mb-1">
                  {isBn ? 'ভিজ্যুয়াল ফ্রেম হ্যাশ (Visual Frame Hash):' : 'Visual Video Hash:'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isBn 
                    ? 'ভিডিওর ফ্রেম পিক্সেল কোঅর্ডিনেট বিশ্লেষণ করে। আমাদের অনুভূমিক মিররিং (Flip), স্পিড ১.০৬x এবং কালার ফিল্টার এই হ্যাশ বদলে দেয়।' 
                    : 'Checks pixel hashes across frames. Mirror flipping, 1.06x speed alteration, and color grading alter the digital checksum.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: 5 Golden Rules */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isBn ? '২. ক্রিয়েটরদের জন্য কপিরাইট-মুক্ত থাকার ৫টি গোল্ডেন রুল' : '2. 5 Golden Rules for 100% Monetization Safety'}
              </span>
            </h4>

            <div className="space-y-2">
              {[
                {
                  titleBn: '১. রূপান্তরমূলক মান যোগ করুন (Transformative Value)',
                  titleEn: '1. Add Transformative Value',
                  descBn: 'শুধুমাত্র সরাসরি অন্য কারও ভিডিও ডাউনলোড করে পুনরায় আপলোড করবেন না। নিজের ভয়েসওভার, রিভিউ, কমেন্ট্রি বা সাবটাইটেল যোগ করুন।',
                  descEn: 'Never re-upload raw clips without purpose. Add critical commentary, voiceover, educational breakdown, or subtitles.',
                },
                {
                  titleBn: '২. স্পিড ও অডিও পিচ পরিবর্তন করুন',
                  titleEn: '2. Tweak Speed & Pitch',
                  descBn: 'ভিডিওর প্লেব্যাক গতি ১.০৫x থেকে ১.০৮x করুন এবং অডিও পিচ +১ সেমিটোন শিফট করুন। এটি দর্শকের জন্য স্বাভাবিক মনে হয় কিন্তু বট ধরতে পারে না।',
                  descEn: 'Set playback speed to 1.05x-1.08x and audio pitch to +1 semitone. Imperceptible to humans, invisible to bots.',
                },
                {
                  titleBn: '৩. ভিডিও ফ্লিপ (Mirror) ও ক্রপ প্রয়োগ করুন',
                  titleEn: '3. Apply Horizontal Mirror & 5-10% Crop',
                  descBn: 'স্ক্রিনের কোঅর্ডিনেট উল্টে দিলে পিক্সেলে পিক্সেল ম্যাচিং ভেঙে যায় এবং ওয়াটারমার্ক কেটে যায়।',
                  descEn: 'Inverting coordinates shatters frame-matching algorithms and crops out broadcaster logos.',
                },
                {
                  titleBn: '৪. ক্লিপের দৈর্ঘ্য সীমিত রাখুন',
                  titleEn: '4. Keep Individual Clip Segments Short',
                  descBn: 'টানা ১ মিনিটের ক্লিপের বদলে ৫-১৫ সেকেন্ডের ছোট ছোট ক্লিপ ব্যবহার করে মাঝে নিজের বক্তব্য বা অ্যানিমেশন রাখুন।',
                  descEn: 'Use 5-15 second cuts instead of long uninterrupted minutes.',
                },
                {
                  titleBn: '৫. সেকশন ১০৭ ডিসক্লেইমার ডেসক্রিপশনে দিন',
                  titleEn: '5. Always Include Section 107 Fair Use Notice',
                  descBn: 'আমাদের অ্যাপের ডিসক্লেইমার কিট থেকে ইংরেজি ও বাংলা ডিসক্লেইমার কপি করে প্রতিটি ভিডিওর ডেসক্রিপশন বক্সে যুক্ত করুন।',
                  descEn: 'Copy and paste our Section 107 legal notice into your video description for manual audit safety.',
                },
              ].map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">
                      {isBn ? rule.titleBn : rule.titleEn}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {isBn ? rule.descBn : rule.descEn}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Monetization FAQs */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <DollarSign className="w-4 h-4" />
              <span>{isBn ? '৩. ইউটিউব মনিটাইজেশন পলিসি ও রিইউজড কন্টেন্ট' : '3. YouTube Monetization & Reused Content Policy'}</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isBn 
                ? 'ইউটিউবের পার্টনার প্রোগ্রাম (YPP) বলে: "Reused content is allowed for monetization IF you have added significant original commentary or educational value." আমাদের স্টুডিওর রিঅ্যাকশন বক্স, ভয়েসওভার রেকর্ডার ও ভিজ্যুয়াল ফিল্টার আপনার ভিডিওকে মনিটাইজেশনের উপযোগী করে তোলে।'
                : 'YouTube Partner Program rules state: "Reused content is allowed for monetization if you have added significant original commentary or educational value." Our reaction PiP mode, voiceover recording, and visual transformations make your content 100% eligible.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition"
          >
            {isBn ? 'আমি বুঝেছি, ধন্যবাদ!' : 'Got It, Thanks!'}
          </button>
        </div>
      </div>
    </div>
  );
};
