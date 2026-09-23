import React, { useState } from 'react';
import { Sparkles, FileText, Hash, Type, Film, Check, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { Language } from '../types';

interface AIVideoToolsProps {
  videoTitle: string;
  language: Language;
  onApplyTitle?: (title: string) => void;
  onSaveProjectAiMeta?: (meta: { aiTitle: string; aiCaption: string; aiHashtags: string[]; aiScript: string }) => void;
}

export const AIVideoTools: React.FC<AIVideoToolsProps> = ({ videoTitle, language, onApplyTitle, onSaveProjectAiMeta }) => {
  const isBn = language === 'bn';
  const [activeTool, setActiveTool] = useState<'title' | 'caption' | 'hashtag' | 'script'>('title');

  // Generator states
  const [topic, setTopic] = useState(videoTitle || '');
  const [niche, setNiche] = useState('Movie Recap / Explainer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generated contents
  const [titles, setTitles] = useState<string[]>([
    'এই দৃশ্যটি দেখার পর আপনি বিশ্বাসই করতে পারবেন না কী ঘটেছিল!',
    'শেষ ১০ সেকেন্ডে পুরো গল্প উল্টে গেল | মুভি ব্যাখ্যা বাংলা',
    'গল্পের পেছনের অজানা রহস্য যা কেউ বলেনি (Unbelievable Ending)',
    'পুরো শহরের ওপর নেমে এলো অদ্ভুত বিপর্যয় | Mystery Explained',
  ]);

  const [caption, setCaption] = useState<string>(
    `🎬 ভিডিও বিবরণী (Video Description):\n` +
    `এই ভিডিওতে আমরা সিনেমাটির গভীর রহস্য এবং জটিল টুইস্টগুলো বিস্তারিতভাবে বিশ্লেষণ করেছি।\n\n` +
    `⚠️ কপিরাইট ও ফেয়ার ইউজ বিজ্ঞপ্তি:\n` +
    `এই ভিডিওটি ইউএস কপিরাইট আইন ১৯৭৬ এর ধারা ১০৭ (Section 107) এর অধীনে ফেয়ার ইউজ নীতির আওতায় শিক্ষামূলক ও সমালোচনামূলক পর্যালোচনার উদ্দেশ্যে তৈরি করা হয়েছে। মূল কাজের কোনো ক্ষতি করার উদ্দেশ্য নেই।\n\n` +
    `ভিডিওটি ভালো লাগলে লাইক ও সাবস্ক্রাইব করে পাশে থাকুন!`
  );

  const [hashtags, setHashtags] = useState<string[]>([
    '#MovieRecap', '#MovieExplained', '#BanglaCinemaReview', '#FreeStudio', '#AIStudio', '#FairUse', '#ViralVideo', '#ThrillerMovie', '#BengaliRecap'
  ]);

  const [scriptHook, setScriptHook] = useState<string>(
    `"কল্পনা করুন, আপনি সকালে ঘুম থেকে উঠে দেখলেন পুরো পৃথিবীতে আপনি ছাড়া আর একটা প্রাণীও বেঁচে নেই! ঠিক এমন এক অদ্ভুত ঘটনার মুখোমুখি হয়েছিল আমাদের আজকের চরিত্রের..."`
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const cleanTopic = topic.trim() || 'রহস্যময় সিনেমা';
      setTitles([
        `এই সিনেমার আসল সত্যটি জানলে গায়ে কাঁটা দিয়ে উঠবে | ${cleanTopic}`,
        `মুহূর্তের মধ্যে পুরো রহস্যের জট খুলে গেল! (${cleanTopic} Recap)`,
        `যে কারণে এই সিনেমাটি সারা বিশ্বে তোলপাড় সৃষ্টি করেছিল | Fair Use Review`,
        `শেষ পর্যন্ত কে রক্ষা পেল? ${cleanTopic} এর চমকপ্রদ ব্যাখ্যা`,
      ]);

      setScriptHook(
        `"হ্যালো দর্শকবৃন্দ! আজকের ভিডিওতে আমরা উন্মোচন করব ${cleanTopic}-এর এমন কিছু চমকপ্রদ তথ্য ও টুইস্ট যা সাধারণ দর্শকেরা খেয়ালই করেননি। বিশেষ করে ক্লাইম্যাক্সের দৃশ্যটি আপনাকে শেষ মুহূর্ত পর্যন্ত রোমাঞ্চিত রাখবে..."`
      );

      if (onSaveProjectAiMeta) {
        onSaveProjectAiMeta({
          aiTitle: titles[0],
          aiCaption: caption,
          aiHashtags: hashtags,
          aiScript: scriptHook,
        });
      }
    }, 800);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden space-y-4">
      
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>{isBn ? 'AI ভিডিও ক্রিয়েশন ও কনটেন্ট টুলস' : 'AI Video Creation Tools'}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono font-bold">
                PRO AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isBn ? 'ইউটিউবের জন্য হাই-ক্লিক টাইটেল, এসইও ক্যাপশন, ভাইরাল হ্যাশট্যাগ ও স্ক্রিপ্ট হুক' : 'Generate viral titles, captions, hashtags & script hooks'}
            </p>
          </div>
        </div>

        {/* Tools tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTool('title')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
              activeTool === 'title' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3 h-3" />
            <span>Title</span>
          </button>
          <button
            onClick={() => setActiveTool('caption')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
              activeTool === 'caption' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Caption</span>
          </button>
          <button
            onClick={() => setActiveTool('hashtag')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
              activeTool === 'hashtag' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>Hashtag</span>
          </button>
          <button
            onClick={() => setActiveTool('script')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
              activeTool === 'script' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Script</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 space-y-4">
        
        {/* Quick Prompt Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="আপনার ভিডিওর মূল বিষয় বা সিনেমার নাম লিখুন (e.g. Inception / Action Movie)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/25 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'জেনারেট হচ্ছে...' : 'AI দিয়ে নতুন বানান'}</span>
          </button>
        </div>

        {/* Tab 1: AI Title Generator */}
        {activeTool === 'title' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400">
              হাই-সিটিআর (High-CTR) ভাইরাল টাইটেল সাজেশন্স:
            </span>
            <div className="space-y-2">
              {titles.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 group transition"
                >
                  <span className="text-xs text-white font-medium">{t}</span>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {onApplyTitle && (
                      <button
                        onClick={() => onApplyTitle(t)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold"
                      >
                        প্রজেক্টে নিন
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(t, `title_${idx}`)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="কপি করুন"
                    >
                      {copiedKey === `title_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: AI Caption Generator */}
        {activeTool === 'caption' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                কপিরাইট সেকশন ১০৭ ডিসক্লেইমার যুক্ত ফুল ইউটিউব ডেসক্রিপশন:
              </span>
              <button
                onClick={() => handleCopy(caption, 'caption_full')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {copiedKey === 'caption_full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'caption_full' ? 'কপি হয়েছে' : 'সব কপি করুন'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-red-500 transition"
            />
          </div>
        )}

        {/* Tab 3: AI Hashtag Generator */}
        {activeTool === 'hashtag' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                শীর্ষ র‍্যাংকিং হ্যাশট্যাগসমূহ (Click to Copy):
              </span>
              <button
                onClick={() => handleCopy(hashtags.join(' '), 'all_hash')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {copiedKey === 'all_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'all_hash' ? 'সব কপি হয়েছে' : 'সব কপি করুন'}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(h, `h_${i}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 text-xs font-mono text-slate-300 hover:text-white transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>{h}</span>
                  {copiedKey === `h_${i}` && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Script Generator */}
        {activeTool === 'script' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                হাই-রিটেনশন স্ক্রিপ্ট হুক ও ইন্ট্রো (Voiceover Hook):
              </span>
              <button
                onClick={() => handleCopy(scriptHook, 'script_hook')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {copiedKey === 'script_hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'script_hook' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={scriptHook}
              onChange={(e) => setScriptHook(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-red-500 transition"
            />
          </div>
        )}

      </div>

    </div>
  );
};
