import React, { useRef } from 'react';
import { Upload, Play, Film, Sparkles, Video as VideoIcon } from 'lucide-react';
import { Language } from '../types';
import { SAMPLE_VIDEOS, SampleVideo } from '../utils/sampleVideos';

interface VideoSourceSelectorProps {
  onVideoSelect: (url: string, title: string) => void;
  currentVideoUrl: string;
  language: Language;
}

export const VideoSourceSelector: React.FC<VideoSourceSelectorProps> = ({
  onVideoSelect,
  currentVideoUrl,
  language,
}) => {
  const isBn = language === 'bn';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      onVideoSelect(objectUrl, file.name);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header and Upload Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center space-x-2">
            <VideoIcon className="w-4 h-4 text-red-500" />
            <span>{isBn ? 'ভিডিও নির্বাচন বা আপলোড করুন' : 'Select or Upload Video'}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {isBn 
              ? 'আপনার নিজস্ব ফাইল আপলোড করুন অথবা ডেমো ক্লিপ দিয়ে তাৎক্ষণিক পরীক্ষা করুন' 
              : 'Upload your video file or choose a sample clip to transform'}
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-red-600/25 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'ডিভাইস থেকে ভিডিও আপলোড' : 'Upload Video File'}</span>
          </button>
        </div>
      </div>

      {/* Demo Clips Grid */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {isBn ? 'অথবা ডেমো ক্লিপ বাছাই করুন (তাৎক্ষণিক পরীক্ষা)' : 'Or Select Instant Sample Clip:'}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_VIDEOS.map((sample: SampleVideo) => {
            const isSelected = currentVideoUrl === sample.url;
            return (
              <div
                key={sample.id}
                onClick={() => onVideoSelect(sample.url, isBn ? sample.titleBn : sample.titleEn)}
                className={`relative rounded-xl border p-2.5 flex items-center space-x-3 transition cursor-pointer group ${
                  isSelected
                    ? 'bg-red-600/10 border-red-500 shadow-md shadow-red-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                  <img
                    src={sample.thumbnail}
                    alt={sample.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-red-400 transition">
                    {isBn ? sample.titleBn : sample.titleEn}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-amber-400">{isBn ? sample.categoryBn : sample.categoryEn}</span>
                    <span>•</span>
                    <span className="font-mono">{sample.duration}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">
                    ID: {sample.mockCopyrightOwner}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
