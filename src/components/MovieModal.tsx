import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Clapperboard, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  Mic, 
  HelpCircle, 
  ArrowRight, 
  Youtube, 
  ShieldCheck, 
  Clock, 
  Flame, 
  Play,
  RotateCw
} from 'lucide-react';
import { Language, MovieRecapScript, TransformSettings } from '../types';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  language: Language;
  onApplyMovieMode: () => void;
  settings: TransformSettings;
  onSettingsChange: (settings: TransformSettings) => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  language,
  onApplyMovieMode,
  settings,
  onSettingsChange,
}) => {
  const isBn = language === 'bn';

  const [movieName, setMovieName] = useState<string>(videoTitle || 'Mystery Thriller');
  const [genre, setGenre] = useState<string>('Suspense / Thriller');
  const [customContext, setCustomContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recapScript, setRecapScript] = useState<MovieRecapScript | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'truth' | 'ai-script' | 'trimmer'>('truth');

  if (!isOpen) return null;

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-movie-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle: movieName,
          genre,
          customContext,
          language,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecapScript(data);
        setActiveTab('ai-script');
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFullScript = () => {
    if (!recapScript) return;
    const fullText = `=== ${recapScript.youtubeTitle} ===\n\n[HOOK]: ${recapScript.hook}\n\n` + 
      recapScript.segments.map(s => `[${s.timeRange}] - ${s.sceneTitle}\n${s.narration}\n(এডিটিং ডিরেকশন: ${s.editingDirection})\n`).join('\n\n') +
      `\n\n[লিগ্যাল নোট]: ${recapScript.fairUseStatement}`;
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 text-amber-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {isBn ? 'মুভি ফাইল ও কপিরাইট-ফ্রি এক্সপ্লেইন স্টুডিও' : 'Full Movie & Recap Explainer Studio'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {isBn ? 'মুভি চ্যানেল স্পেশাল' : 'Movie Explainer Special'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBn 
                  ? 'মুভি ফাইল দিয়ে কীভাবে কপিরাইট স্ট্রাইক ছাড়া সম্পূর্ণ মনিটাইজেশন যোগ্য ভিডিও বানাবেন' 
                  : 'How to legally transform any movie into a 100% monetizable, strike-free video'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 text-xs font-semibold px-2">
          <button
            onClick={() => setActiveTab('truth')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'truth'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isBn ? '১. ফুল মুভি ও কপিরাইট সত্যতা (অবশ্যই পড়ুন)' : '1. Full Movie Copyright Truth'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-script')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'ai-script'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBn ? '২. এআই মুভি রিক্যাপ ও ভয়েসওভার স্ক্রিপ্ট' : '2. AI Movie Script Generator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('trimmer')}
            className={`py-3 px-4 border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'trimmer'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isBn ? '৩. মুভি সিন ট্রিমার ও রিক্যাপ রেঞ্জ' : '3. Scene Trimmer & Range'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300 flex-1">
          {/* TAB 1: TRUTH & STRATEGY */}
          {activeTab === 'truth' && (
            <div className="space-y-5">
              {/* Direct Answer Alert */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-red-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Flame className="w-5 h-5 text-red-500 animate-bounce" />
                  <span>
                    {isBn 
                      ? 'প্রশ্ন: আমি একটা মুভি ফাইল দিলে কি এটা পুরো মুভিকে ফুল কপিরাইট ফ্রি করে দেবে?' 
                      : 'Question: If I input a movie file, will it make the full movie completely copyright free?'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {isBn ? (
                    <>
                      <strong>বাস্তব সত্য:</strong> আপনি যদি কোনো সিনেমার পুরো ২ ঘণ্টা হুবহু (Uncut & Raw) কোনো নিজের ভয়েস বা বিশ্লেষণ ছাড়া ইউটিউবে আপলোড করেন, তবে যেকোনো সফটওয়্যার ফিল্টার দিলেও মুভি স্টুডিওগুলো (Disney, Warner Bros, Sony, T-Series ইত্যাদি) ম্যানুয়াল ক্লেইম বা স্ট্রাইক পাঠাবে।<br />
                      <strong>কিন্তু সুসংবাদ হলো:</strong> ইউটিউবে লক্ষ লক্ষ মুভি চ্যানেল (যেমন <em>Movie Recaps</em>, <em>Mystery Recapped</em>, বাংলা মুভি এক্সপ্লেইন চ্যানেল) প্রতি মাসে লাখ লাখ টাকা ইনকাম করছে এই একই মুভি ফাইল ব্যবহার করে! তারা কীভাবে করে? নিচের ফর্মুলাটি অনুসরণ করে:
                    </>
                  ) : (
                    <>
                      <strong>The Legal Truth:</strong> Re-uploading an entire 2-hour movie without commentary or analysis will always trigger manual takedowns by film studios regardless of filters.<br />
                      <strong>The Winning Strategy:</strong> Movie Explainer / Recap channels make millions of dollars safely by transforming film clips into 5-15 minute narrative stories under the Fair Use Doctrine!
                    </>
                  )}
                </p>
              </div>

              {/* The 4-Step Movie Formula */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isBn ? 'ইউটিউবে মুভি থেকে লাখ টাকা ইনকামের ৪টি প্রমাণিত নিয়ম' : 'The 4-Step Strike-Proof Movie Monetization Formula'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-red-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs">১</span>
                      <span>{isBn ? 'ক্লিপিং ও হাইলাইটস কাট (Trimming)' : '1. Cut Into Scene Highlights'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isBn 
                        ? 'টানা ২ ঘণ্টার মুভি দেওয়ার বদলে গল্পের প্রধান দৃশ্যগুলো ৫ থেকে ১৫ মিনিটের মধ্যে রাখুন। আমাদের স্টুডিওর ট্রিমার দিয়ে সহজেই দৃশ্য সিলেক্ট করুন।' 
                        : 'Never upload uncut 2 hours. Keep the story between 5-15 minutes using our built-in Scene Trimmer.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">২</span>
                      <span>{isBn ? 'মুভি অডিও ডাকিং ও মিউজিক সোয়াপ' : '2. Duck Movie Audio & Swap Music'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isBn 
                        ? 'মুভির ব্যাকগ্রাউন্ড গান ও বিজিএম ৯০% কপিরাইটের কারণ। আমাদের অ্যাপের মাধ্যমে মুভির সাউন্ড ২০% এ নামিয়ে নো-কপিরাইট সিনেমাটিক মিউজিক দিন।' 
                        : 'Studio background tracks cause 90% of claims. Duck movie audio to 20% and replace with our suspenseful royalty-free music.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">৩</span>
                      <span>{isBn ? 'ভিজ্যুয়াল মিরর ও লোগো ক্রপ' : '3. Mirror Coordinate & Logo Crop'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isBn 
                        ? 'ভিডিও মিরর (Mirror) করুন, ১.০৬x স্পিড দিন এবং ১২% জুম দিন যাতে কোনো সিনেমা হল বা টিভির ওয়াটারমার্ক কেটে যায়।' 
                        : 'Mirror frames horizontally, apply 1.06x speed, and 12% crop to erase all studio and broadcaster watermarks.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">৪</span>
                      <span>{isBn ? 'নিজস্ব ভয়েসওভার (The Real Secret)' : '4. Add Voiceover Commentary'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {isBn 
                        ? 'আমাদের "এআই স্ক্রিপ্ট জেনারেটর" থেকে মুভির গল্পের স্ক্রিপ্ট তৈরি করে নিজের গলায় মুখে বলুন। এটি ইউটিউবে ১০০% লিগ্যাল ফেয়ার ইউজ।' 
                        : 'Use our AI Script tool to generate a thrilling narration script, then record over it. This gives guaranteed Fair Use legal protection!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white block">
                    {isBn ? '১-ক্লিকে মুভি এক্সপ্লেইন মোড চালু করতে চান?' : 'Ready to enable Movie Explainer Mode?'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {isBn 
                      ? 'মিরর, ১.০৬x স্পিড, লোগো ক্রপ ও সিনেমাটিক ব্যাকগ্রাউন্ড মিউজিক এক ক্লিকে চালু হয়ে যাবে।' 
                      : 'Automatically sets up optimal crop, coordinate inversion, audio ducking, and legal banners.'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onApplyMovieMode();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-red-600/20 flex items-center space-x-1.5 transition"
                  >
                    <Clapperboard className="w-4 h-4" />
                    <span>{isBn ? 'মুভি মোড চালু করুন' : 'Apply Movie Mode'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ai-script')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'এআই দিয়ে স্ক্রিপ্ট লিখুন' : 'Generate AI Script'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI SCRIPT GENERATOR */}
          {activeTab === 'ai-script' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm block flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'মুভির নাম দিন এবং এআই দিয়ে সম্পূর্ণ ভয়েসওভার স্ক্রিপ্ট তৈরি করুন' : 'AI Movie Explainer & Voiceover Script Generator'}</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      {isBn ? 'মুভির নাম বা বিষয়:' : 'Movie Title / Topic:'}
                    </label>
                    <input
                      type="text"
                      value={movieName}
                      onChange={(e) => setMovieName(e.target.value)}
                      placeholder={isBn ? 'যেমন: Inception, Avatar, জাওয়ান, অথবা যে কোনো গল্প' : 'e.g. Inception, Avatar, Titanic, or Plot summary'}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      {isBn ? 'মুভির ধরণ (Genre):' : 'Genre:'}
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Suspense / Thriller">Suspense / Thriller (সাসপেন্স)</option>
                      <option value="Action / Adventure">Action / Adventure (অ্যাকশন)</option>
                      <option value="Horror / Mystery">Horror / Mystery (হরর/রহস্য)</option>
                      <option value="Sci-Fi / Space">Sci-Fi (সাই-ফাই)</option>
                      <option value="Emotional Drama">Emotional Drama (ইমোশনাল ড্রামা)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    {isBn ? 'অতিরিক্ত কোনো দৃশ্য বা প্লট বিবরণ (ঐচ্ছিক):' : 'Additional scene details or twist (optional):'}
                  </label>
                  <input
                    type="text"
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder={isBn ? 'যেমন: নায়ক একটি দ্বীপে আটকা পড়ে এবং শেষ মুহূর্তে আসল পরিচয় প্রকাশ পায়...' : 'e.g. The hero wakes up in a locked bunker...'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:opacity-90 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'এআই মুভি স্ক্রিপ্ট তৈরি করছে...' : 'Generating AI Script...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isBn ? 'মুভি এক্সপ্লেইন স্ক্রিপ্ট তৈরি করুন' : 'Generate Full Recap Script'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Script Display */}
              {recapScript && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">
                        {isBn ? 'ইউটিউবের জন্য সেরা আকর্ষণীয় টাইটেল:' : 'Viral YouTube Title:'}
                      </span>
                      <h4 className="text-sm font-bold text-white">{recapScript.youtubeTitle}</h4>
                    </div>

                    <button
                      onClick={copyFullScript}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? (isBn ? 'স্ক্রিপ্ট কপি হয়েছে!' : 'Copied!') : (isBn ? 'সম্পূর্ণ স্ক্রিপ্ট কপি করুন' : 'Copy Full Script')}</span>
                    </button>
                  </div>

                  {/* Hook */}
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-red-400 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{isBn ? 'প্রথম ১০ সেকেন্ডের হুক (দর্শকদের ধরে রাখার জন্য):' : '10-Second Opening Hook:'}</span>
                    </span>
                    <p className="text-slate-200 text-xs italic">"{recapScript.hook}"</p>
                  </div>

                  {/* Segments */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'দৃশ্যভিত্তিক ভয়েসওভার ও এডিটিং নির্দেশিকা:' : 'Timed Scenes & Voiceover Narration:'}
                    </span>

                    {recapScript.segments.map((seg, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400 text-xs">{seg.sceneTitle}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                            {seg.timeRange}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-lg text-slate-200 text-xs leading-relaxed font-sans border border-slate-800/80">
                          {seg.narration}
                        </div>

                        <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                          <span className="text-blue-400 font-semibold">{isBn ? 'ভিডিও নির্দেশনা:' : 'Visual Edit:'}</span>
                          <span>{seg.editingDirection}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCENE TRIMMER */}
          {activeTab === 'trimmer' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-white text-sm block flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{isBn ? 'মুভি ট্রিম ও ক্লিপ রেঞ্জ কাটার' : 'Movie Scene Trimmer & Range Selector'}</span>
                </span>
                <p className="text-slate-400 text-xs">
                  {isBn 
                    ? '২ ঘণ্টার বড় মুভি ফাইল থেকে এক্সপোর্টের জন্য নির্দিষ্ট দৃশ্য বা ৫-১০ মিনিটের হাইলাইটস রেঞ্জ নির্ধারণ করুন।' 
                    : 'Set exact start and end timestamps so you export crisp 5-10 minute highlights without browser lag.'}
                </p>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      {isBn ? 'ট্রিম ও রেঞ্জ ফিল্টার সক্রিয় করুন' : 'Enable Trimmer & Export Range'}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.isTrimActive}
                      onChange={(e) => onSettingsChange({ ...settings, isTrimActive: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </div>

                  {settings.isTrimActive && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          {isBn ? 'শুরুর সময় (সেকেন্ডে):' : 'Start Time (Seconds):'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={settings.trimStart}
                          onChange={(e) => onSettingsChange({ ...settings, trimStart: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          {isBn ? 'শেষের সময় (সেকেন্ডে, ০ = সম্পূর্ণ):' : 'End Time (Seconds, 0 = Full):'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={settings.trimEnd}
                          onChange={(e) => onSettingsChange({ ...settings, trimEnd: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Presets for Trimming */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    {isBn ? 'দ্রুত ক্লিপ প্রিসেট:' : 'Quick Trimming Presets:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSettingsChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 60 })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                    >
                      {isBn ? '১ম ১ মিনিট (শর্টস/রিলস)' : 'First 1 Minute (Shorts)'}
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 300 })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                    >
                      {isBn ? 'প্রথম ৫ মিনিট (মুভি রিক্যাপ)' : 'First 5 Minutes (Recap)'}
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 600 })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                    >
                      {isBn ? 'প্রথম ১০ মিনিট (ফুল দৃশ্য)' : 'First 10 Minutes'}
                    </button>
                    <button
                      onClick={() => onSettingsChange({ ...settings, isTrimActive: false, trimStart: 0, trimEnd: 0 })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs"
                    >
                      {isBn ? 'সম্পূর্ণ ভিডিও' : 'Full Video'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isBn ? 'ফেয়ার ইউজ ধারা ১০৭ দ্বারা সুরক্ষিত' : 'Protected Under Section 107 Fair Use'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onApplyMovieMode();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
            >
              {isBn ? 'মুভি মোড সেট করুন' : 'Apply Movie Settings'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
