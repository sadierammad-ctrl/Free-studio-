import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SavedVideoProject } from '../types';
import { Play, Download, Trash2, Clock, CheckCircle2, AlertTriangle, Video, Sparkles } from 'lucide-react';

interface MyVideosViewProps {
  onCreateNew: () => void;
  onSelectVideoForStudio?: (url: string, title: string) => void;
}

export const MyVideosView: React.FC<MyVideosViewProps> = ({ onCreateNew, onSelectVideoForStudio }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedVideoProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/videos/my-videos', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ভিডিওটি ডিলিট করতে চান?')) return;
    if (!user) return;

    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">আমার ভিডিও প্রজেক্ট (My Videos)</h2>
          <p className="text-xs text-slate-400">আপনার সংরক্ষিত সমস্ত এআই প্রসেস করা ও এক্সপোর্টেড ভিডিও</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>নতুন ভিডিও বানান (Create Video)</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">লোড হচ্ছে...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-300">এখনও কোনো ভিডিও তৈরি করেননি</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              ক্লিপ আপলোড করুন এবং এআই স্ক্রিপ্ট ও কনটেন্ট আইডি বাইপাস সেটিংস দিয়ে তৈরি করে নিন আকর্ষণীয় ভিডিও।
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
          >
            প্রথম ভিডিও তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={proj.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5">
                  {proj.status === 'completed' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center space-x-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Completed</span>
                    </span>
                  ) : proj.status === 'processing' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5 animate-spin" />
                      <span>Processing</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-sm flex items-center space-x-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-white backdrop-blur-sm">
                  {Math.floor(proj.durationSeconds / 60)}:{(proj.durationSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5 flex-1">
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  {proj.title}
                </h4>

                {proj.aiTitle && (
                  <p className="text-[11px] text-amber-400/90 font-medium line-clamp-1">
                    AI Title: {proj.aiTitle}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{new Date(proj.createdAt).toLocaleDateString('bn-BD')}</span>
                  <span>{proj.fileSizeMb || 12} MB</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectVideoForStudio && onSelectVideoForStudio(proj.videoUrl, proj.title)}
                  className="flex items-center space-x-1 text-xs font-semibold text-red-400 hover:text-red-300 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>স্টুডিওতে খুলুন</span>
                </button>

                <div className="flex items-center space-x-2">
                  <a
                    href={proj.videoUrl || '#'}
                    download={proj.title + '.mp4'}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="ডাউনলোড"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
