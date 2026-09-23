import React, { useState } from 'react';
import { 
  Wand2, 
  Video, 
  Music, 
  Layers, 
  FlipHorizontal, 
  Gauge, 
  Crop, 
  Palette, 
  Radio, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Volume2,
  Sliders,
  Type,
  Maximize,
  HelpCircle,
  Smartphone,
  Clapperboard,
  Scissors,
  Clock
} from 'lucide-react';
import { TransformSettings, Language, VideoFilterType, AspectRatioType } from '../types';
import { PRESETS, ROYALTY_FREE_TRACKS } from '../utils/presets';

interface TransformControlsProps {
  settings: TransformSettings;
  onChange: (settings: TransformSettings) => void;
  language: Language;
  onOpenMovieModal?: () => void;
}

export const TransformControls: React.FC<TransformControlsProps> = ({
  settings,
  onChange,
  language,
  onOpenMovieModal,
}) => {
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'presets' | 'movie' | 'visual' | 'audio' | 'overlay'>('presets');

  const updateSetting = <K extends keyof TransformSettings>(key: K, value: TransformSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      onChange({ ...settings, ...preset.settings });
    }
  };

  const filters: { id: VideoFilterType; labelBn: string; labelEn: string; iconColor: string }[] = [
    { id: 'none', labelBn: 'কোনোটি না', labelEn: 'Normal', iconColor: 'bg-slate-700' },
    { id: 'cinematic', labelBn: 'সিনেমাটিক টিল', labelEn: 'Cinematic Teal', iconColor: 'bg-cyan-600' },
    { id: 'warm', labelBn: 'উষ্ণ ভিন্টেজ', labelEn: 'Warm Vintage', iconColor: 'bg-amber-600' },
    { id: 'vibrant', labelBn: 'উজ্জ্বল ভাইব্রেন্ট', labelEn: 'Vibrant Pop', iconColor: 'bg-rose-500' },
    { id: 'cyberpunk', labelBn: 'সাইবারপাঙ্ক', labelEn: 'Cyberpunk', iconColor: 'bg-purple-600' },
    { id: 'noir', labelBn: 'ব্ল্যাক & হোয়াইট', labelEn: 'Film Noir', iconColor: 'bg-zinc-800' },
    { id: 'sepia', labelBn: 'সেপিয়া গোল্ড', labelEn: 'Sepia Gold', iconColor: 'bg-yellow-700' },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="grid grid-cols-5 bg-slate-950 border-b border-slate-800 text-[11px] font-semibold">
        <button
          onClick={() => setActiveTab('presets')}
          className={`py-3 px-1 flex items-center justify-center space-x-1 transition border-b-2 ${
            activeTab === 'presets'
              ? 'border-red-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">{isBn ? 'প্রিসেট' : 'Presets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('movie')}
          className={`py-3 px-1 flex items-center justify-center space-x-1 transition border-b-2 ${
            activeTab === 'movie'
              ? 'border-red-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">{isBn ? '🍿 মুভি' : 'Movie'}</span>
        </button>

        <button
          onClick={() => setActiveTab('visual')}
          className={`py-3 px-1 flex items-center justify-center space-x-1 transition border-b-2 ${
            activeTab === 'visual'
              ? 'border-red-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">{isBn ? 'ভিজ্যুয়াল' : 'Visuals'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`py-3 px-1 flex items-center justify-center space-x-1 transition border-b-2 ${
            activeTab === 'audio'
              ? 'border-red-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate">{isBn ? 'অডিও' : 'Audio EQ'}</span>
        </button>

        <button
          onClick={() => setActiveTab('overlay')}
          className={`py-3 px-1 flex items-center justify-center space-x-1 transition border-b-2 ${
            activeTab === 'overlay'
              ? 'border-red-500 text-white bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="truncate">{isBn ? 'ফ্রেম' : 'Overlays'}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[500px] space-y-4">
        {/* ================= PRESETS TAB ================= */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isBn ? '১-ক্লিক দ্রুত রূপান্তর প্রোফাইল' : '1-Click Quick Bypass Profiles'}
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                {isBn ? 'স্বয়ংক্রিয় অপ্টিমাইজেশন' : 'Auto-Optimized'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-red-500/40 transition cursor-pointer group flex flex-col space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition flex items-center space-x-1.5">
                      <span>{isBn ? preset.nameBn : preset.nameEn}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isBn ? preset.descriptionBn : preset.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MOVIE TAB ================= */}
        {activeTab === 'movie' && (
          <div className="space-y-4 text-xs">
            {/* AI Script & Fair Use Truth Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <Clapperboard className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'মুভি ফাইল থেকে আয় করার সেরা কৌশল' : 'Movie Explainer Strategy'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  {isBn ? 'ফেয়ার ইউজ ধারা ১০৭' : 'Section 107'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {isBn 
                  ? 'পুরো সিনেমা কাঁচা আপলোড না করে ৫-১৫ মিনিটের রিক্যাপ হাইলাইটস তৈরি করুন। আমাদের এআই স্ক্রিপ্ট দিয়ে নিজস্ব ভাষায় ভয়েসওভার দিলে কপিরাইট ক্লেইমের কোনো সুযোগ থাকে না।' 
                  : 'Transform full movies into 5-15 minute narrated recap highlights to ensure 100% strike-free monetization.'}
              </p>

              <div className="flex items-center space-x-2 pt-1">
                {onOpenMovieModal && (
                  <button
                    onClick={onOpenMovieModal}
                    className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-90 text-white font-bold text-[11px] shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isBn ? 'এআই মুভি স্ক্রিপ্ট ও ফুল গাইড' : 'AI Movie Script & Guide'}</span>
                  </button>
                )}
                <button
                  onClick={() => applyPreset('movie-recap-master')}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition cursor-pointer"
                >
                  {isBn ? 'মুভি সেটিংস সেট' : 'Apply Settings'}
                </button>
              </div>
            </div>

            {/* Movie Scene Trimmer Section */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'মুভি সিন ট্রিমার (Scene Trimmer)' : 'Movie Scene Trimmer'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.isTrimActive}
                  onChange={(e) => updateSetting('isTrimActive', e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'বড় মুভি থেকে এক্সপোর্টের জন্য নির্দিষ্ট ৫-১০ মিনিটের আকর্ষণীয় দৃশ্য নির্বাচন করুন।' 
                  : 'Set start and end bounds so you export specific high-retention scenes.'}
              </p>

              {settings.isTrimActive && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isBn ? 'শুরুর সময় (সেকেন্ডে):' : 'Start (Seconds):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.trimStart}
                      onChange={(e) => updateSetting('trimStart', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isBn ? 'শেষের সময় (সেকেন্ডে):' : 'End (Seconds, 0 = Full):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={settings.trimEnd}
                      onChange={(e) => updateSetting('trimEnd', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Quick Range Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => onChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 60 })}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  {isBn ? '১ম ১ মিনিট (Shorts)' : '1 Min (Shorts)'}
                </button>
                <button
                  onClick={() => onChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 300 })}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  {isBn ? '১ম ৫ মিনিট (Recap)' : '5 Min (Recap)'}
                </button>
                <button
                  onClick={() => onChange({ ...settings, isTrimActive: true, trimStart: 0, trimEnd: 600 })}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  {isBn ? '১ম ১০ মিনিট' : '10 Min'}
                </button>
                <button
                  onClick={() => onChange({ ...settings, isTrimActive: false, trimStart: 0, trimEnd: 0 })}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  {isBn ? 'সম্পূর্ণ' : 'Full'}
                </button>
              </div>
            </div>

            {/* Movie Audio Ducking */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'মুভির মূল সাউন্ড কমান (Audio Ducking)' : 'Original Audio Ducking'}
                  </span>
                </div>
                <span className="font-mono text-amber-400 font-semibold">{settings.originalAudioVolume}%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'মুভির সাউন্ড ২০% এ রাখলে আপনার ভয়েসওভার স্পষ্ট শোনা যাবে এবং ব্যাকগ্রাউন্ড মিউজিক কপিরাইট ধরবে না।' 
                  : 'Ducking volume to 20% keeps movie dialog subtle while your voice commentary leads.'}
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.originalAudioVolume}
                onChange={(e) => updateSetting('originalAudioVolume', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Studio Logo Cropper */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crop className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'স্টুডিও লোগো ও ওয়াটারমার্ক ক্রপার (Crop Zoom)' : 'Studio Logo Cropper'}
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold">+{settings.zoom}%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? '৮% থেকে ১২% জুম দিলে কোণায় থাকা প্রযোজনা সংস্থার লোগো ও টিভির ওয়াটারমার্ক ফ্রেমের বাইরে চলে যায়।' 
                  : 'Zooming 8-12% pushes TV & studio logos out of the frame.'}
              </p>
              <input
                type="range"
                min={0}
                max={25}
                value={settings.zoom}
                onChange={(e) => updateSetting('zoom', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        )}

        {/* ================= VISUALS TAB ================= */}
        {activeTab === 'visual' && (
          <div className="space-y-4 text-xs">
            {/* Mirror / Flip Row */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                  <FlipHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {isBn ? 'ভিডিও ফ্লিপ / মিরর করুন' : 'Horizontal Flip (Mirror)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isBn 
                      ? 'ভিজ্যুয়াল ফিঙ্গারপ্রিন্ট ভেঙে ফেলে ও ফ্রেম ম্যাচিং বন্ধ করে।'
                      : 'Flips coordinate pixels to invalidate YouTube Content ID visual hash.'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.mirror}
                onChange={(e) => updateSetting('mirror', e.target.checked)}
                className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
              />
            </div>

            {/* Playback Speed Multiplier */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'ভিডিও প্লেব্যাক স্পিড' : 'Playback Speed (FPS Shift)'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                    {settings.speed}x
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    (১.০৫x - ১.০৮x সবচেয়ে নিরাপদ)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={0.9}
                max={1.25}
                step={0.01}
                value={settings.speed}
                onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.9x</span>
                <span className="text-emerald-400 font-semibold">1.06x (Sweet Spot)</span>
                <span>1.25x</span>
              </div>
            </div>

            {/* Zoom & Crop Slider */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crop className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'ক্রপ ও জুম (ফ্রেম পরিবর্তন)' : 'Frame Zoom & Crop'}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                  +{settings.zoom}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={settings.zoom}
                onChange={(e) => updateSetting('zoom', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-[10px] text-slate-400">
                {isBn 
                  ? 'ধার ঘেঁষা ওয়াটারমার্ক কেটে ফেলে এবং রেজোলিউশন ফ্রেম পরিবর্তন করে।'
                  : 'Crops outer broadcast watermarks and re-hashes spatial boundary.'}
              </p>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-white block">
                {isBn ? 'অ্যাসপেক্ট রেশিও ফরম্যাট' : 'Aspect Ratio Format'}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '16:9', label: '16:9 (Standard)' },
                  { id: '9:16', label: '9:16 (Shorts)' },
                  { id: '1:1', label: '1:1 (Square)' },
                  { id: '21:9', label: '21:9 (Cinema)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateSetting('aspectRatio', item.id as AspectRatioType)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium border transition ${
                      settings.aspectRatio === item.id
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter Selector */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-white block">
                {isBn ? 'কালার গ্রেডিং ফিল্টার (Color Grading LUT)' : 'Color Grading Filter'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSetting('filter', f.id)}
                    className={`py-2 px-2 rounded-lg text-left border flex items-center space-x-2 transition ${
                      settings.filter === f.id
                        ? 'border-red-500 bg-red-600/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${f.iconColor}`} />
                    <span className="truncate">{isBn ? f.labelBn : f.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Noise & Vignette Toggles */}
            <div className="grid grid-cols-2 gap-2">
              <label className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <span className="text-white font-medium">
                  {isBn ? 'ভিজ্যুয়াল নয়েজ (Grain)' : 'Film Grain'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.hasNoise}
                  onChange={(e) => updateSetting('hasNoise', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600"
                />
              </label>

              <label className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <span className="text-white font-medium">
                  {isBn ? 'ভিগনেট শ্যাডো' : 'Vignette'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.vignette}
                  onChange={(e) => updateSetting('vignette', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* ================= AUDIO TAB ================= */}
        {activeTab === 'audio' && (
          <div className="space-y-4 text-xs">
            {/* Pitch Shift Slider */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'অডিও পিচ শিফট (Pitch Shift)' : 'Audio Pitch Shift'}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  {settings.pitchShift > 0 ? `+${settings.pitchShift}` : settings.pitchShift} সেমিটোন
                </span>
              </div>
              <input
                type="range"
                min={-3}
                max={3}
                step={1}
                value={settings.pitchShift}
                onChange={(e) => updateSetting('pitchShift', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-3 (Deeper)</span>
                <span className="text-emerald-400 font-bold">0 (Original)</span>
                <span className="text-emerald-400 font-bold">+1 (Recommended)</span>
                <span>+3 (Higher)</span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isBn 
                  ? '+১ সেমিটোন অডিও ফ্রিকোয়েন্সি পরিবর্তন করে যার ফলে স্বয়ংক্রিয় অডিও কন্টেন্ট আইডি গান বা ভয়েস চিনতে পারে না।'
                  : '+1 Semitone shifts fundamental frequency peaks, disrupting acoustic Content ID recognition.'}
              </p>
            </div>

            {/* Original Audio Volume / Mute */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white">
                    {isBn ? 'মূল ভিডিওর ভলিউম' : 'Original Video Audio'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-300 font-mono">
                    {settings.muteOriginalAudio ? '0%' : `${settings.originalAudioVolume}%`}
                  </span>
                  <button
                    onClick={() => updateSetting('muteOriginalAudio', !settings.muteOriginalAudio)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      settings.muteOriginalAudio ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {settings.muteOriginalAudio ? (isBn ? 'মিউটেড' : 'Muted') : (isBn ? 'মিউট করুন' : 'Mute')}
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.muteOriginalAudio ? 0 : settings.originalAudioVolume}
                disabled={settings.muteOriginalAudio}
                onChange={(e) => updateSetting('originalAudioVolume', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
              />
            </div>

            {/* Royalty-Free Background Music Selector */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'রয়্যালটি-ফ্রি ব্যাকগ্রাউন্ড মিউজিক' : 'Royalty-Free Music Replacement'}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">১০০% কপিরাইট-মুক্ত</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('royaltyFreeMusicTrack', 'none')}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    settings.royaltyFreeMusicTrack === 'none'
                      ? 'border-red-500 bg-red-600/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{isBn ? 'কোনো মিউজিক নয়' : 'No Music'}</div>
                  <div className="text-[10px] text-slate-500">{isBn ? 'কেবলমাত্র মূল অডিও' : 'Raw Audio Only'}</div>
                </button>

                {ROYALTY_FREE_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSetting('royaltyFreeMusicTrack', t.id)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      settings.royaltyFreeMusicTrack === t.id
                        ? 'border-emerald-500 bg-emerald-600/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold truncate">{isBn ? t.titleBn : t.title}</div>
                    <div className="text-[10px] text-slate-500">{isBn ? t.genreBn : t.genre}</div>
                  </button>
                ))}
              </div>

              {settings.royaltyFreeMusicTrack !== 'none' && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{isBn ? 'মিউজিক ভলিউম:' : 'Music Volume:'}</span>
                    <span className="font-mono text-emerald-400">{settings.royaltyFreeVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={settings.royaltyFreeVolume}
                    onChange={(e) => updateSetting('royaltyFreeVolume', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Acoustic Watermark High-Pass Filter */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">
                  {isBn ? 'অ্যাকোস্টিক ওয়াটারমার্ক ব্যান্ডপাস ফিল্টার' : 'Acoustic EQ Anti-Watermark'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn 
                    ? 'গানের মধ্যে থাকা অপ্রকাশ্য আল্ট্রাসনিক ওয়াটারমার্ক মুছে দেয়।'
                    : 'Attenuates inaudible ultrasonic watermarks in broadcast audio.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.audioHighPassFilter}
                onChange={(e) => updateSetting('audioHighPassFilter', e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600"
              />
            </div>
          </div>
        )}

        {/* ================= OVERLAYS TAB ================= */}
        {activeTab === 'overlay' && (
          <div className="space-y-4 text-xs">
            {/* Legal Fair Use Disclaimer Banner */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'সেকশন ১০৭ ফেয়ার ইউজ লোয়ার-থার্ড ব্যানার' : 'Section 107 Fair Use Banner'}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isBn 
                    ? 'ভিডিওর নিচে আইনগত পর্যালোচনা নোটিশ প্রদর্শন করে (YouTube রিভিউতে সাহায্য করে)।'
                    : 'Draws official Fair Use legal notice bar at the bottom of the video.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.hasDisclaimerOverlay}
                onChange={(e) => updateSetting('hasDisclaimerOverlay', e.target.checked)}
                className="w-5 h-5 rounded text-amber-500"
              />
            </div>

            {/* Reaction Picture-in-Picture Webcam Box */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">
                    {isBn ? 'রিঅ্যাকশন / কমেন্ট্রি ওয়েবক্যাম বক্স (PiP)' : 'Reaction / Commentary PiP Box'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isBn 
                      ? 'কোণায় ক্রিয়েটর রিঅ্যাকশন ফ্রেম যুক্ত করে যাতে ভিডিওটি রূপান্তরমূলক প্রমাণ হয়।'
                      : 'Simulates creator reaction window to guarantee transformative Fair Use.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showReactionBox}
                  onChange={(e) => updateSetting('showReactionBox', e.target.checked)}
                  className="w-5 h-5 rounded text-blue-500"
                />
              </div>

              {settings.showReactionBox && (
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {isBn ? 'রিঅ্যাকশন বক্সের লেবেল:' : 'Reaction Box Label:'}
                  </label>
                  <input
                    type="text"
                    value={settings.reactionLabel}
                    onChange={(e) => updateSetting('reactionLabel', e.target.value)}
                    placeholder="Creator Reaction & Review"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Channel Branding / Watermark */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {isBn ? 'কাস্টম চ্যানেল ওয়াটারমার্ক / ব্র্যান্ডিং' : 'Custom Channel Watermark'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.hasWatermark}
                  onChange={(e) => updateSetting('hasWatermark', e.target.checked)}
                  className="w-5 h-5 rounded text-red-600"
                />
              </div>

              {settings.hasWatermark && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={settings.watermarkText}
                    onChange={(e) => updateSetting('watermarkText', e.target.value)}
                    placeholder="My Channel / Fair Use Review"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">{isBn ? 'পজিশন:' : 'Position:'}</span>
                    <select
                      value={settings.watermarkPosition}
                      onChange={(e) => updateSetting('watermarkPosition', e.target.value as any)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-center">Top Center</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Frame Border & Color */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {isBn ? 'ভিডিও ফ্রেম বর্ডার' : 'Frame Border'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.hasBorder}
                  onChange={(e) => updateSetting('hasBorder', e.target.checked)}
                  className="w-5 h-5 rounded text-blue-500"
                />
              </div>
              {settings.hasBorder && (
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-slate-400">{isBn ? 'বর্ডার কালার:' : 'Color:'}</span>
                  <div className="flex space-x-2">
                    {['#1e293b', '#3b82f6', '#ef4444', '#f59e0b', '#000000'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateSetting('borderColor', c)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          settings.borderColor === c ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
