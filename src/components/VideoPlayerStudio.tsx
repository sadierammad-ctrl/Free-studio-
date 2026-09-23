import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sliders, 
  Maximize2, 
  Eye, 
  Columns, 
  CheckCircle2, 
  Sparkles, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  RefreshCw, 
  Clock,
  Clapperboard,
  Scissors
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TransformSettings, Language, AspectRatioType } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface VideoPlayerStudioProps {
  videoSrc: string;
  videoTitle: string;
  settings: TransformSettings;
  onSettingsChange: (settings: TransformSettings) => void;
  language: Language;
  onQuickPreset: (presetId: string) => void;
  onOpenMovieModal?: () => void;
}

export const VideoPlayerStudio: React.FC<VideoPlayerStudioProps> = ({
  videoSrc,
  videoTitle,
  settings,
  onSettingsChange,
  language,
  onQuickPreset,
  onOpenMovieModal,
}) => {
  const isBn = language === 'bn';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'transformed' | 'split' | 'original'>('transformed');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  // Canvas dimensions based on aspect ratio
  const getCanvasDimensions = (aspect: AspectRatioType): { width: number; height: number } => {
    switch (aspect) {
      case '9:16':
        return { width: 720, height: 1280 };
      case '1:1':
        return { width: 720, height: 720 };
      case '21:9':
        return { width: 1280, height: 548 };
      case '16:9':
      default:
        return { width: 1280, height: 720 };
    }
  };

  // Sync video playback rate with speed setting
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.speed;
    }
  }, [settings.speed]);

  // Sync audio volumes & filters with AudioEngine
  useEffect(() => {
    audioEngine.setVideoVolume(settings.originalAudioVolume, settings.muteOriginalAudio);
  }, [settings.originalAudioVolume, settings.muteOriginalAudio]);

  useEffect(() => {
    audioEngine.setAudioFilter(settings.audioHighPassFilter);
  }, [settings.audioHighPassFilter]);

  useEffect(() => {
    if (isPlaying) {
      audioEngine.playTrack(settings.royaltyFreeMusicTrack, settings.royaltyFreeVolume);
    } else {
      audioEngine.stopMusic();
    }
  }, [settings.royaltyFreeMusicTrack, settings.royaltyFreeVolume, isPlaying]);

  // Attach video to audio engine once video is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      audioEngine.connectVideoElement(videoRef.current);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (settings.isTrimActive && settings.trimEnd > 0 && cur >= settings.trimEnd && !isExporting) {
        videoRef.current.currentTime = settings.trimStart || 0;
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    audioEngine.init();
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      audioEngine.stopMusic();
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        if (settings.royaltyFreeMusicTrack !== 'none') {
          audioEngine.playTrack(settings.royaltyFreeMusicTrack, settings.royaltyFreeVolume);
        }
      }).catch(err => console.error('Play failed:', err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleToggleMic = async () => {
    const active = await audioEngine.toggleMicrophone();
    setIsMicActive(active);
  };

  // Main Canvas Rendering Loop
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: targetWidth, height: targetHeight } = getCanvasDimensions(settings.aspectRatio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // CSS Filter string calculation
    let filterString = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
    if (settings.filter === 'cinematic') {
      filterString += ` contrast(120%) saturate(125%) hue-rotate(-6deg)`;
    } else if (settings.filter === 'warm') {
      filterString += ` sepia(25%) saturate(120%) brightness(104%)`;
    } else if (settings.filter === 'cyberpunk') {
      filterString += ` contrast(135%) saturate(145%) hue-rotate(20deg)`;
    } else if (settings.filter === 'noir') {
      filterString += ` grayscale(85%) contrast(140%)`;
    } else if (settings.filter === 'sepia') {
      filterString += ` sepia(70%) contrast(110%)`;
    } else if (settings.filter === 'vibrant') {
      filterString += ` saturate(155%) contrast(115%)`;
    }

    const vw = video.videoWidth || targetWidth;
    const vh = video.videoHeight || targetHeight;

    // Crop / Zoom calculation
    const zoomFactor = 1 + (settings.zoom / 100);
    const cropW = vw / zoomFactor;
    const cropH = vh / zoomFactor;
    const cropX = (vw - cropW) / 2;
    const cropY = (vh - cropH) / 2;

    // Handle 9:16 Shorts Mode with blurred background
    if (settings.aspectRatio === '9:16') {
      // 1. Blurred background
      ctx.save();
      ctx.filter = 'blur(25px) brightness(60%)';
      ctx.drawImage(video, 0, 0, vw, vh, -targetWidth * 0.5, 0, targetWidth * 2, targetHeight);
      ctx.restore();

      // 2. Foreground transformed video
      ctx.save();
      ctx.filter = filterString;

      const fgH = (targetWidth / vw) * vh;
      const fgY = (targetHeight - fgH) / 2;

      if (settings.mirror) {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, fgY, targetWidth, fgH);
      ctx.restore();

      // Border around centered video in shorts mode
      if (settings.hasBorder) {
        ctx.strokeStyle = settings.borderColor || '#3b82f6';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, fgY, targetWidth - 4, fgH);
      }
    } else {
      // Standard 16:9, 1:1, or 21:9
      ctx.save();
      ctx.filter = filterString;

      if (settings.mirror) {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);
      ctx.restore();

      // Border
      if (settings.hasBorder) {
        ctx.strokeStyle = settings.borderColor || '#1e293b';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, targetWidth - 8, targetHeight - 8);
      }
    }

    // Vignette Effect
    if (settings.vignette) {
      const gradient = ctx.createRadialGradient(
        targetWidth / 2, targetHeight / 2, targetWidth * 0.35,
        targetWidth / 2, targetHeight / 2, targetWidth * 0.75
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Film Grain / Noise Simulation
    if (settings.hasNoise) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let i = 0; i < 400; i++) {
        const nx = Math.random() * targetWidth;
        const ny = Math.random() * targetHeight;
        ctx.fillRect(nx, ny, 2, 2);
      }
    }

    // Reaction Box / Picture-in-Picture simulator
    if (settings.showReactionBox) {
      const boxW = Math.round(targetWidth * 0.24);
      const boxH = Math.round(boxW * 0.75);
      const boxX = targetWidth - boxW - 24;
      const boxY = 24;

      // Box backdrop
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Reaction Cam Graphic
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(boxX + boxW / 2, boxY + boxH / 2 - 8, boxH * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Live Pulse Dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(boxX + 16, boxY + 16, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('REC', boxX + 26, boxY + 20);

      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(settings.reactionLabel || 'Creator Reaction', boxX + boxW / 2, boxY + boxH - 10);
      ctx.textAlign = 'left';
    }

    // Disclaimer Overlay Banner
    if (settings.hasDisclaimerOverlay) {
      const bannerH = 34;
      const bannerY = targetHeight - bannerH;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, bannerY, targetWidth, bannerH);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('⚖️ FAIR USE (SEC. 107):', 16, bannerY + 22);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        isBn 
          ? 'সমালোচনা ও শিক্ষামূলক পর্যালোচনার জন্য রূপান্তরিত রূপ (Fair Use Transformation)' 
          : 'Transformative use for critical commentary & review. No copyright infringement intended.',
        175, bannerY + 22
      );
    }

    // Watermark text
    if (settings.hasWatermark && settings.watermarkText) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 15px sans-serif';

      let wx = 24;
      let wy = 36;
      if (settings.watermarkPosition === 'top-right') {
        wx = targetWidth - ctx.measureText(settings.watermarkText).width - 24;
        wy = 36;
      } else if (settings.watermarkPosition === 'bottom-left') {
        wx = 24;
        wy = targetHeight - (settings.hasDisclaimerOverlay ? 46 : 24);
      } else if (settings.watermarkPosition === 'bottom-right') {
        wx = targetWidth - ctx.measureText(settings.watermarkText).width - 24;
        wy = targetHeight - (settings.hasDisclaimerOverlay ? 46 : 24);
      } else if (settings.watermarkPosition === 'top-center') {
        wx = (targetWidth - ctx.measureText(settings.watermarkText).width) / 2;
        wy = 40;
      }

      ctx.fillText(settings.watermarkText, wx, wy);
      ctx.restore();
    }

    ctx.restore();

    animFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [settings, isBn]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [renderFrame]);

  // Video Export Engine with MediaRecorder
  const handleExportVideo = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    setIsExporting(true);
    setExportProgress(5);
    setExportedUrl(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Reset video to start
    video.currentTime = 0;
    audioEngine.init();

    // Create stream from canvas (30fps)
    const canvasStream = canvas.captureStream(30);
    const audioStream = audioEngine.getExportStream();

    const combinedTracks: MediaStreamTrack[] = [
      ...canvasStream.getVideoTracks(),
    ];

    if (audioStream && audioStream.getAudioTracks().length > 0) {
      combinedTracks.push(...audioStream.getAudioTracks());
    }

    const exportStream = new MediaStream(combinedTracks);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(exportStream, {
      mimeType,
      videoBitsPerSecond: 4500000,
    });

    const recordedChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setIsExporting(false);
      setExportProgress(100);

      // Save project to backend if user is logged in
      const currentUserId = localStorage.getItem('fs_user_id');
      if (currentUserId) {
        try {
          await fetch('/api/videos/save-project', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': currentUserId,
            },
            body: JSON.stringify({
              title: videoTitle || 'AI Fair Use Project',
              videoUrl: url,
              durationSeconds: Math.round(duration || 30),
              fileSizeMb: Number((blob.size / (1024 * 1024)).toFixed(1)) || 15,
            }),
          });
        } catch (e) {
          console.error('Failed to save project:', e);
        }
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    };

    const exportStart = (settings.isTrimActive && settings.trimStart > 0) ? settings.trimStart : 0;
    const exportEnd = (settings.isTrimActive && settings.trimEnd > exportStart) 
      ? Math.min(settings.trimEnd, video.duration || 999999) 
      : (video.duration || 10);

    video.currentTime = exportStart;
    setCurrentTime(exportStart);
    await new Promise((r) => setTimeout(r, 150));

    recorder.start(100);

    // Play video to record through duration
    try {
      await video.play();
      setIsPlaying(true);
      if (settings.royaltyFreeMusicTrack !== 'none') {
        audioEngine.playTrack(settings.royaltyFreeMusicTrack, settings.royaltyFreeVolume);
      }

      const totalSegment = Math.max(1, exportEnd - exportStart);
      const interval = setInterval(() => {
        if (!video.paused && !video.ended) {
          const elapsed = video.currentTime - exportStart;
          const pct = Math.min(95, Math.max(1, Math.round((elapsed / totalSegment) * 100)));
          setExportProgress(pct);
        }
        if (video.ended || video.currentTime >= exportEnd) {
          clearInterval(interval);
          video.pause();
          setIsPlaying(false);
          recorder.stop();
        }
      }, 200);
    } catch (e) {
      console.error('Export playback failed:', e);
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Studio Header Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-slate-200 truncate max-w-[240px] sm:max-w-md">
            {videoTitle}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {settings.aspectRatio} | {settings.speed}x | {settings.filter !== 'none' ? settings.filter : (isBn ? 'স্বাভাবিক কালার' : 'Natural')}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMovieModal && (
            <button
              onClick={onOpenMovieModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition cursor-pointer"
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>{isBn ? 'মুভি এক্সপ্লেইন ও এআই স্ক্রিপ্ট' : 'Movie Explainer & Script'}</span>
            </button>
          )}

          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('transformed')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                viewMode === 'transformed' 
                  ? 'bg-red-600 text-white font-medium shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'রূপান্তরিত ফেয়ার ইউজ' : 'Fair-Use Output'}</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                viewMode === 'split' 
                  ? 'bg-red-600 text-white font-medium shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isBn ? 'তুলনামূলক দৃশ্য' : 'Side-by-Side'}</span>
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition ${
                viewMode === 'original' 
                  ? 'bg-red-600 text-white font-medium shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBn ? 'মূল ভিডিও' : 'Original Raw'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Viewport Stage */}
      <div className="relative bg-black flex items-center justify-center min-h-[360px] max-h-[580px] p-2 sm:p-4 overflow-hidden">
        {/* Hidden or visible raw video element */}
        <video
          ref={videoRef}
          src={videoSrc}
          crossOrigin="anonymous"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className={`${viewMode === 'original' ? 'max-h-[500px] w-auto max-w-full rounded-lg shadow-lg' : viewMode === 'split' ? 'w-1/2 max-h-[460px] object-contain rounded-lg border border-slate-700' : 'hidden'}`}
        />

        {/* Transformed Canvas Output */}
        <canvas
          ref={canvasRef}
          className={`${viewMode === 'original' ? 'hidden' : viewMode === 'split' ? 'w-1/2 max-h-[460px] object-contain rounded-lg border border-red-500/40 ml-2' : 'max-h-[520px] w-auto max-w-full rounded-xl shadow-2xl ring-1 ring-slate-700/50'}`}
        />

        {/* Split View Labels */}
        {viewMode === 'split' && (
          <div className="absolute top-4 left-6 right-6 flex justify-between pointer-events-none">
            <span className="bg-slate-900/90 text-rose-400 text-xs px-2.5 py-1 rounded-full border border-rose-500/40 font-semibold shadow">
              {isBn ? '⚠️ কপিরাইটযুক্ত মূল (Original)' : '⚠️ Raw Original (Risk: 85%)'}
            </span>
            <span className="bg-slate-900/90 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 font-semibold shadow">
              {isBn ? '✅ ফেয়ার ইউজ রূপান্তরিত (Bypassed)' : '✅ Fair-Use Output (Safe)'}
            </span>
          </div>
        )}

        {/* Overlay when paused */}
        {!isPlaying && !isExporting && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/25 transition group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </button>
        )}

        {/* Export Progress Overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 z-20">
            <RefreshCw className="w-10 h-10 text-red-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold mb-2">
              {isBn ? 'ভিডিও রূপান্তর ও এক্সপোর্ট হচ্ছে...' : 'Rendering Copyright-Free Video...'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-md text-center">
              {isBn 
                ? 'ব্রাউজারে সরাসরি ফ্রেম প্রসেসিং, অডিও পিচ শিফটিং এবং ফেয়ার ইউজ এনকোডিং সম্পন্ন করা হচ্ছে।'
                : 'Direct in-browser frame rendering, pitch-shifting, and Fair Use MP4/WebM encoding in progress.'}
            </p>
            <div className="w-64 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-sm font-mono mt-2 text-slate-300">{exportProgress}%</span>
          </div>
        )}
      </div>

      {/* Video Control Bar & Scrubbing */}
      <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-col space-y-2">
        {/* Scrubber slider */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 w-10">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {formatTime(duration)}
          </span>
          {settings.isTrimActive && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono border border-amber-500/30 whitespace-nowrap">
              ✂️ {formatTime(settings.trimStart)} - {formatTime(settings.trimEnd || duration)}
            </span>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          {/* Left Play/Pause & Reset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition shadow shadow-red-600/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isBn ? 'শুরু থেকে দেখুন' : 'Restart'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mute Original Audio Toggle */}
            <button
              onClick={() => onSettingsChange({ ...settings, muteOriginalAudio: !settings.muteOriginalAudio })}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                settings.muteOriginalAudio 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isBn ? 'কপিরাইটযুক্ত অডিও মিউট করুন' : 'Mute original audio'}
            >
              {settings.muteOriginalAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{settings.muteOriginalAudio ? (isBn ? 'মূল অডিও মিউট' : 'Audio Muted') : (isBn ? 'মূল অডিও' : 'Audio On')}</span>
            </button>

            {/* Mic Voiceover Button */}
            <button
              onClick={handleToggleMic}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                isMicActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'লাইভ ভয়েস ওভার বা কমেন্ট্রি রেকর্ড করুন' : 'Record voice commentary'}
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isMicActive ? (isBn ? 'মাইক লাইভ' : 'Mic Live') : (isBn ? '+ভয়েসওভার' : '+Voiceover')}</span>
            </button>
          </div>

          {/* Right: Export & Download Buttons */}
          <div className="flex items-center space-x-2">
            {exportedUrl ? (
              <a
                href={exportedUrl}
                download={`Copyright_Free_${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}.webm`}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/30 animate-bounce"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'ডাউনলোড করুন (কপিরাইট ফ্রি)' : 'Download Ready Video'}</span>
              </a>
            ) : (
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-semibold text-xs transition shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'কপিরাইট-ফ্রি এক্সপোর্ট করুন' : 'Export Copyright-Free'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
