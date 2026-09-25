import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoSourceSelector } from './components/VideoSourceSelector';
import { VideoPlayerStudio } from './components/VideoPlayerStudio';
import { TransformControls } from './components/TransformControls';
import { RiskMeter } from './components/RiskMeter';
import { DisclaimerModal } from './components/DisclaimerModal';
import { GuideModal } from './components/GuideModal';
import { MovieModal } from './components/MovieModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { SubscriptionView } from './components/SubscriptionView';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { MyVideosView } from './components/MyVideosView';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { AIVideoTools } from './components/AIVideoTools';
import { TransformSettings, Language } from './types';
import { SAMPLE_VIDEOS } from './utils/sampleVideos';
import { PRESETS } from './utils/presets';
import { useAuth } from './context/AuthContext';
import { ShieldCheck, Video, Sparkles, Download, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function App() {
  const { user, canCreateVideo, deviceConflict, refreshUser, settings: appSettings } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'create' | 'videos' | 'subscription' | 'payments' | 'profile' | 'admin'>('dashboard');

  const [language, setLanguage] = useState<Language>('bn');
  const isBn = language === 'bn';

  // Video state
  const [videoUrl, setVideoUrl] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [videoTitle, setVideoTitle] = useState<string>(SAMPLE_VIDEOS[0].titleBn);

  // Transform Settings (Defaulted to optimal 95% safe bypass profile)
  const [settings, setSettings] = useState<TransformSettings>({
    mirror: true,
    speed: 1.06,
    zoom: 8,
    filter: 'cinematic',
    filterIntensity: 80,
    brightness: 102,
    contrast: 108,
    saturation: 115,
    aspectRatio: '16:9',
    vignette: true,
    hasBorder: true,
    borderColor: '#1e293b',
    hasNoise: true,
    hasWatermark: true,
    watermarkText: 'FREE STUDIO · Section 107 Fair Use',
    watermarkPosition: 'bottom-right',
    hasDisclaimerOverlay: true,
    showReactionBox: false,
    reactionLabel: 'Creator Reaction & Review',
    pitchShift: 1,
    muteOriginalAudio: false,
    originalAudioVolume: 90,
    royaltyFreeMusicTrack: 'none',
    royaltyFreeVolume: 75,
    audioHighPassFilter: true,
    isTrimActive: false,
    trimStart: 0,
    trimEnd: 0,
    isMovieMode: false,
  });

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleApplyMovieMode = () => {
    const moviePreset = PRESETS.find(p => p.id === 'movie-recap-master');
    if (moviePreset) {
      setSettings(prev => ({
        ...prev,
        ...moviePreset.settings,
        isMovieMode: true,
      }));
    }
  };

  // Compute live local risk score for Header indicator
  let riskScore = 85;
  if (settings.mirror) riskScore -= 18;
  if (settings.speed > 1.03 || settings.speed < 0.97) riskScore -= 20;
  if (settings.zoom >= 5) riskScore -= 15;
  if (settings.filter !== 'none') riskScore -= 12;
  if (settings.muteOriginalAudio || settings.royaltyFreeMusicTrack !== 'none') {
    riskScore -= 25;
  } else if (Math.abs(settings.pitchShift) >= 1) {
    riskScore -= 18;
  }
  if (settings.hasBorder) riskScore -= 8;
  if (settings.hasDisclaimerOverlay) riskScore -= 7;
  if (settings.showReactionBox) riskScore -= 10;
  riskScore = Math.max(5, Math.min(95, riskScore));

  const handleVideoSelect = (url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
  };

  const handleCreateVideoNav = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const check = canCreateVideo();
    if (!check.allowed) {
      if (check.limitReached) {
        setCurrentTab('subscription');
      } else {
        alert(check.reason);
      }
      return;
    }
    setCurrentTab('create');
  };

  // Show splash screen on first load
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          setShowSplash(false);
          // If no user logged in, open Auth modal as requested: "Then automatically go to Login/Register."
          if (!localStorage.getItem('fs_user_id')) {
            setIsAuthOpen(true);
          }
        }}
      />
    );
  }

  // Pre-creation checks for Create Video tab
  const createCheck = canCreateVideo();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-600 selection:text-white font-sans antialiased">
      
      {/* Top Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDisclaimerModal={() => setIsDisclaimerOpen(true)}
        onOpenMovieModal={() => setIsMovieModalOpen(true)}
        onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onNavigateTab={setCurrentTab}
        currentTab={currentTab}
        riskScore={riskScore}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Device Mismatch Critical Warning */}
        {deviceConflict && (
          <div className="p-4 rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>
                <b>This subscription is already active on another device.</b> ১ সাবস্ক্রিপশন = ১ ডিভাইস পলিসি।
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('profile')}
              className="px-3 py-1 bg-rose-600 rounded-lg text-white font-bold"
            >
              ডিভাইস দেখুন
            </button>
          </div>
        )}

        {/* 1. USER DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setCurrentTab}
            onOpenAuthModal={() => setIsAuthOpen(true)}
          />
        )}

        {/* 2. CREATE VIDEO / STUDIO TAB */}
        {currentTab === 'create' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ড্যাশবোর্ডে ফিরুন</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">বর্তমান প্ল্যান:</span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {user ? `${user.subscriptionPlan} PLAN` : 'FREE PLAN'}
                </span>
              </div>
            </div>

            {/* Check limit enforcement */}
            {!createCheck.allowed && createCheck.limitReached ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    “Your free video limit has been used. Upgrade your plan to create more videos.”
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    আপনার ফ্রি প্ল্যানের ১টি ভিডিও তৈরির সীমা শেষ হয়েছে। আনলিমিটেড এআই ভিডিও প্রসেসিং পেতে আমাদের আকর্ষণীয় প্যাকেজে আপগ্রেড করুন।
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('subscription')}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs shadow-xl transition cursor-pointer"
                >
                  Upgrade Plan (GO / PLUS / PRO / MAX)
                </button>
              </div>
            ) : (
              <>
                {/* AI Content Generator Box (Title, Caption, Hashtag, Script) */}
                <AIVideoTools
                  videoTitle={videoTitle}
                  language={language}
                  onApplyTitle={(t) => setVideoTitle(t)}
                />

                {/* Video Source Selection (Local Upload & Samples) */}
                <VideoSourceSelector
                  onVideoSelect={handleVideoSelect}
                  currentVideoUrl={videoUrl}
                  language={language}
                />

                {/* Studio Grid: Player on left, Controls on right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Player & Canvas Stage */}
                  <div className="lg:col-span-7 space-y-6">
                    <VideoPlayerStudio
                      videoSrc={videoUrl}
                      videoTitle={videoTitle}
                      settings={settings}
                      onSettingsChange={setSettings}
                      language={language}
                      onQuickPreset={() => {}}
                      onOpenMovieModal={() => setIsMovieModalOpen(true)}
                    />

                    {/* Quick Tips */}
                    <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
                      <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isBn ? 'FREE STUDIO প্রো টিপস:' : 'FREE STUDIO Pro Advice:'}</span>
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                        <li>ভিডিও ফ্লিপ / মিরর এবং ১.০৬x স্পিড ইউটিউব অডিও ও ভিডিও ফ্রেম হ্যাশ পরিবর্তন করে।</li>
                        <li>এক্সপোর্ট বাটনে চাপ দিয়ে রূপান্তরিত ফুল এইচডি ভিডিওটি আপনার মেমোরিতে সংরক্ষণ করুন।</li>
                        <li>ইউটিউবে আপলোড করার সময় এআই ক্যাপশন বক্স থেকে ধারা ১০৭ কপিরাইট নোটিশ পেস্ট করুন।</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Controls & Risk Audit */}
                  <div className="lg:col-span-5 space-y-6">
                    <TransformControls
                      settings={settings}
                      onChange={setSettings}
                      language={language}
                      onOpenMovieModal={() => setIsMovieModalOpen(true)}
                    />

                    <RiskMeter
                      settings={settings}
                      videoTitle={videoTitle}
                      language={language}
                    />
                  </div>

                </div>
              </>
            )}

          </div>
        )}

        {/* 3. MY VIDEOS TAB */}
        {currentTab === 'videos' && (
          <MyVideosView
            onCreateNew={handleCreateVideoNav}
            onSelectVideoForStudio={(url, title) => {
              setVideoUrl(url);
              setVideoTitle(title);
              setCurrentTab('create');
            }}
          />
        )}

        {/* 4. SUBSCRIPTION / PLANS TAB */}
        {currentTab === 'subscription' && (
          <SubscriptionView
            onBack={() => setCurrentTab('dashboard')}
          />
        )}

        {/* 5. PAYMENT HISTORY TAB */}
        {currentTab === 'payments' && (
          <PaymentHistoryView />
        )}

        {/* 6. USER PROFILE TAB */}
        {currentTab === 'profile' && (
          <ProfileView
            onGoToSubscription={() => setCurrentTab('subscription')}
          />
        )}

        {/* 7. ADMIN PANEL TAB */}
        {currentTab === 'admin' && (
          <AdminPanel />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-900 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-slate-400">
            <Video className="w-4 h-4 text-red-500" />
            <span className="font-bold text-white">FREE STUDIO</span>
            <span>•</span>
            <span>AI Video Studio & Content ID Protection</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-slate-300 transition"
            >
              ফেয়ার ইউজ গাইড
            </button>
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="hover:text-slate-300 transition"
            >
              ধারা ১০৭ নোটিশ
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className="text-amber-400 font-bold hover:underline"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        videoTitle={videoTitle}
        language={language}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={language}
      />

      <MovieModal
        isOpen={isMovieModalOpen}
        onClose={() => setIsMovieModalOpen(false)}
        videoTitle={videoTitle}
        language={language}
        onApplyMovieMode={handleApplyMovieMode}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
        language={language}
      />

      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="fixed bottom-16 left-4 z-50 flex items-center space-x-2 bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold px-3.5 py-1.5 rounded-full text-xs shadow-xl border border-amber-300">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
          <span>অফলাইন মোড — সম্পূর্ণ ব্রাউজারে কাজ করছে</span>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />

    </div>
  );
}
