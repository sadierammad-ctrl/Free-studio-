export type Language = 'bn' | 'en';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '21:9';

export type VideoFilterType = 
  | 'none'
  | 'cinematic'
  | 'warm'
  | 'cyberpunk'
  | 'noir'
  | 'sepia'
  | 'vibrant'
  | 'grain';

export interface TransformSettings {
  mirror: boolean;
  speed: number; // 0.8 to 1.3
  zoom: number; // 0 to 25 (%)
  filter: VideoFilterType;
  filterIntensity: number; // 0 to 100
  brightness: number; // 80 to 130 (%)
  contrast: number; // 80 to 140 (%)
  saturation: number; // 80 to 150 (%)
  aspectRatio: AspectRatioType;
  vignette: boolean;
  hasBorder: boolean;
  borderColor: string;
  hasNoise: boolean;
  hasWatermark: boolean;
  watermarkText: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center';
  hasDisclaimerOverlay: boolean;
  showReactionBox: boolean;
  reactionLabel: string;
  
  // Audio settings
  pitchShift: number; // -3 to +3
  muteOriginalAudio: boolean;
  originalAudioVolume: number; // 0 to 100
  royaltyFreeMusicTrack: string; // 'none' | 'lofi' | 'upbeat' | 'cinematic' | 'ambient'
  royaltyFreeVolume: number; // 0 to 100
  audioHighPassFilter: boolean;

  // Movie Trimming & Segment Selection
  isTrimActive: boolean;
  trimStart: number; // in seconds
  trimEnd: number; // in seconds (0 = full length)
  isMovieMode: boolean;
}

export interface MovieRecapScript {
  youtubeTitle: string;
  hook: string;
  segments: {
    timeRange: string;
    sceneTitle: string;
    narration: string;
    editingDirection: string;
  }[];
  monetizationTips: string[];
  fairUseStatement: string;
}

export interface Preset {
  id: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  icon: string;
  badge: string;
  settings: Partial<TransformSettings>;
}

export interface RoyaltyFreeTrack {
  id: string;
  title: string;
  titleBn: string;
  genre: string;
  genreBn: string;
  bpm: number;
  duration: string;
  type: 'synth-lofi' | 'synth-upbeat' | 'synth-ambient' | 'synth-cinematic';
}

export interface RiskAnalysis {
  riskScore: number;
  safetyRating: string;
  summary: string;
  keyRisks: string[];
  recommendedActions: string[];
  contentIdBypassChecklist: {
    rule: string;
    passed: boolean;
    tip: string;
  }[];
  monetizationAdvice: string;
}

export type PlanId = 'FREE' | 'GO' | 'PLUS' | 'PRO' | 'MAX';

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  price: number; // in BDT (৳)
  durationDays: number; // 0 for FREE, 30 for GO, 60 for PLUS, 150 for PRO, 365 for MAX
  durationText: string;
  videoLimit: number; // 1 for FREE, 9999 for premium
  features: string[];
  themeColor: string; // Tailwind color key, e.g., 'emerald', 'blue', 'purple', 'amber'
  isAvailable: boolean;
}

export interface UserDevice {
  deviceId: string;
  deviceLabel: string;
  userAgent: string;
  firstBoundAt: string;
  lastActiveAt: string;
  ipAddress?: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  role: 'user' | 'admin';
  subscriptionPlan: PlanId;
  subscriptionStartAt: string | null;
  subscriptionExpireAt: string | null;
  videosCreatedCount: number;
  videoLimit: number;
  activeDeviceId: string | null;
  deviceInfo: UserDevice | null;
  isSuspended: boolean;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
}

export type PaymentMethod = 'bKash' | 'Nagad';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userEmail: string;
  planId: PlanId;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  senderNumber: string;
  transactionId: string;
  status: PaymentStatus;
  adminNote?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface AppSettings {
  appName: string;
  logoText: string;
  announcement: string;
  bkashNumber: string;
  nagadNumber: string;
  isBkashActive: boolean;
  isNagadActive: boolean;
  isMaintenanceMode: boolean;
  isRegistrationOpen: boolean;
  isLoginOpen: boolean;
  freePlanVideoLimit: number;
}

export interface SavedVideoProject {
  id: string;
  userId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSeconds: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  settings: TransformSettings;
  aiTitle?: string;
  aiCaption?: string;
  aiHashtags?: string[];
  aiScript?: string;
  fileSizeMb?: number;
}

