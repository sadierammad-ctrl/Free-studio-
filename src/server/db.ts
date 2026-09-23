import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'freestudio_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function hashPassword(plainText: string): string {
  return crypto.createHash('sha256').update(plainText + 'fs_salt_2026').digest('hex');
}

export interface StoredUser {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  subscriptionPlan: 'FREE' | 'GO' | 'PLUS' | 'PRO' | 'MAX';
  subscriptionStartAt: string | null;
  subscriptionExpireAt: string | null;
  videosCreatedCount: number;
  videoLimit: number;
  activeDeviceId: string | null;
  deviceLabel: string | null;
  deviceBoundAt: string | null;
  isSuspended: boolean;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl: string;
}

export interface StoredPayment {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userEmail: string;
  planId: 'FREE' | 'GO' | 'PLUS' | 'PRO' | 'MAX';
  planName: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad';
  senderNumber: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface StoredPlan {
  id: 'FREE' | 'GO' | 'PLUS' | 'PRO' | 'MAX';
  name: string;
  tagline: string;
  price: number;
  durationDays: number;
  durationText: string;
  videoLimit: number;
  features: string[];
  themeColor: string;
  isAvailable: boolean;
}

export interface StoredSettings {
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

export interface StoredNotification {
  id: string;
  userId: string; // or 'all'
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  userId: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  durationSeconds: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  settings: any;
  aiTitle?: string;
  aiCaption?: string;
  aiHashtags?: string[];
  aiScript?: string;
  fileSizeMb?: number;
}

export interface DatabaseSchema {
  users: StoredUser[];
  payments: StoredPayment[];
  plans: StoredPlan[];
  settings: StoredSettings;
  notifications: StoredNotification[];
  projects: StoredProject[];
}

const DEFAULT_PLANS: StoredPlan[] = [
  {
    id: 'FREE',
    name: 'FREE',
    tagline: 'নতুন ব্যবহারকারীদের জন্য ফ্রি ট্রায়াল',
    price: 0,
    durationDays: 0,
    durationText: 'আজীবন (১টি ভিডিও)',
    videoLimit: 1,
    features: [
      '১টি সম্পূর্ণ ভিডিও প্রসেসিং ও এক্সপোর্ট',
      'বেসিক মিরর ও স্পিড টিউনিং (১.০৬x)',
      'কপিরাইট রিক্স স্কোর অ্যানালাইসিস',
      'ইউটিউব ফেয়ার ইউজ ডিসক্লেইমার কিট',
      '১ ডিভাইস বাইন্ডিং'
    ],
    themeColor: 'slate',
    isAvailable: true,
  },
  {
    id: 'GO',
    name: 'GO',
    tagline: 'মাসিক আনলিমিটেড ভিডিও ক্রিয়েশন',
    price: 150,
    durationDays: 30,
    durationText: '১ মাস (1 Month)',
    videoLimit: 9999,
    features: [
      'আনলিমিটেড ভিডিও ক্রিয়েশন ও এক্সপোর্ট',
      'ফুল সিনেমাটিক ফিল্টার ও কালার গ্রেডিং',
      'অডিও পিচ শিফট ও ভয়েসওভার মাইক্রোফোন',
      'AI টাইটেল ও হ্যাশট্যাগ জেনারেটর',
      'প্রাইওরিটি রেন্ডারিং স্পিড',
      '১ ডিভাইসে সক্রিয় অনুমোদন'
    ],
    themeColor: 'emerald',
    isAvailable: true,
  },
  {
    id: 'PLUS',
    name: 'PLUS',
    tagline: 'জনপ্রিয় ২ মাসের প্রিমিয়াম স্টুডিও প্যাকেজ',
    price: 275,
    durationDays: 60,
    durationText: '২ মাস (2 Months)',
    videoLimit: 9999,
    features: [
      'সব GO ফিচারের সুবিধা অন্তর্ভুক্ত',
      'AI স্ক্রিপ্ট ও মুভি রিক্যাপ জেনারেটর',
      'রয়্যালটি-ফ্রি অডিও লাইব্রেরি (Lo-fi/Cinematic)',
      'আল্ট্রা এইচডি ও ৬০ FPS এক্সপোর্ট অপশন',
      'ফুল স্ক্রিন রিঅ্যাকশন বক্স ফ্রেম',
      'ডেডিকেটেড হোয়াটসঅ্যাপ হেল্পডেস্ক'
    ],
    themeColor: 'blue',
    isAvailable: true,
  },
  {
    id: 'PRO',
    name: 'PRO',
    tagline: 'প্রফেশনাল কন্টেন্ট ক্রিয়েটর ও মুভি রিক্যাপারদের জন্য',
    price: 500,
    durationDays: 150,
    durationText: '৫ মাস (5 Months)',
    videoLimit: 9999,
    features: [
      'সব PLUS প্ল্যানের সুবিধা অন্তর্ভুক্ত',
      'উন্নত কনটেন্ট আইডি ডিপ-হ্যাশ বাইপাস',
      '১০+ কাস্টম ওয়াটারমার্ক ও ব্রান্ডিং ফ্রেম',
      'মাল্টি-সিন ট্রিমার ও ক্লিপ কাটার',
      'ইউটিউব কপিরাইট ডিসপিউট লিগ্যাল এসিস্ট্যান্ট',
      'হাই স্পিড ব্রাউজার এক্সপোর্ট ক্যাশ'
    ],
    themeColor: 'purple',
    isAvailable: true,
  },
  {
    id: 'MAX',
    name: 'MAX',
    tagline: 'বার্ষিক ভিআইপি মেগা স্টুডিও পাস (সর্বোচ্চ সেভিংস)',
    price: 1000,
    durationDays: 365,
    durationText: '১ বছর (1 Year)',
    videoLimit: 9999,
    features: [
      'সব ফিচারের আনলিমিটেড লাইফস্টাইল অ্যাক্সেস',
      'সম্পূর্ণ ১ বছরের জন্য নিশ্চিন্ত সার্ভিস',
      'আনলিমিটেড এআই স্ক্রিপ্ট ও মুভি রিক্যাপ',
      'নতুন সব ভবিষ্যৎ আপগ্রেড বিনামূল্যে',
      'সর্বোচ্চ প্রায়োরিটি প্রসেসিং ইঞ্জিন',
      'ভিআইপি ডাইরেক্ট সাপোর্ট ও ডিভাইস আনবাইন্ড'
    ],
    themeColor: 'amber',
    isAvailable: true,
  }
];

const DEFAULT_SETTINGS: StoredSettings = {
  appName: 'FREE STUDIO',
  logoText: 'FREE STUDIO',
  announcement: 'স্বাগতম FREE STUDIO-তে! বিকাশ বা নগদ এর মাধ্যমে প্রিমিয়াম সাবস্ক্রিপশন নিন এবং ১-ডিভাইসে নিরাপদে আনলিমিটেড এআই ভিডিও বানান।',
  bkashNumber: '01835053993',
  nagadNumber: '01835053993',
  isBkashActive: true,
  isNagadActive: true,
  isMaintenanceMode: false,
  isRegistrationOpen: true,
  isLoginOpen: true,
  freePlanVideoLimit: 1,
};

// Seed default admin and sample test user
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'admin-fs-001',
    fullName: 'FREE STUDIO Admin',
    mobileNumber: '01835053993',
    email: 'admin@freestudio.app',
    passwordHash: hashPassword('admin1234'),
    role: 'admin',
    subscriptionPlan: 'MAX',
    subscriptionStartAt: new Date().toISOString(),
    subscriptionExpireAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
    videosCreatedCount: 0,
    videoLimit: 999999,
    activeDeviceId: null,
    deviceLabel: null,
    deviceBoundAt: null,
    isSuspended: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-demo-001',
    fullName: 'রহিম চৌধুরী (Demo User)',
    mobileNumber: '01711223344',
    email: 'user@freestudio.app',
    passwordHash: hashPassword('user1234'),
    role: 'user',
    subscriptionPlan: 'FREE',
    subscriptionStartAt: new Date().toISOString(),
    subscriptionExpireAt: null,
    videosCreatedCount: 0,
    videoLimit: 1,
    activeDeviceId: null,
    deviceLabel: null,
    deviceBoundAt: null,
    isSuspended: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  }
];

function initDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      payments: [
        {
          id: 'pay-sample-001',
          userId: 'user-demo-001',
          userName: 'রহিম চৌধুরী (Demo User)',
          userMobile: '01711223344',
          userEmail: 'user@freestudio.app',
          planId: 'GO',
          planName: 'GO (১ মাস)',
          amount: 150,
          paymentMethod: 'bKash',
          senderNumber: '01711223344',
          transactionId: 'TXN8829104',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        }
      ],
      plans: DEFAULT_PLANS,
      settings: DEFAULT_SETTINGS,
      notifications: [
        {
          id: 'notif-001',
          userId: 'all',
          title: 'FREE STUDIO-তে স্বাগতম!',
          message: 'প্রতিটি নতুন একাউন্টে ১টি সম্পূর্ণ ফ্রি ভিডিও তৈরির সুযোগ সক্রিয় হয়েছে।',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ],
      projects: [
        {
          id: 'proj-demo-1',
          userId: 'user-demo-001',
          title: 'Action Movie Trailer Recap',
          thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          durationSeconds: 30,
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          settings: {},
          aiTitle: 'এই মুভির শেষ দৃশ্যটি সবাইকে অবাক করেছে!',
          aiCaption: 'মুভি এক্সপ্লেইন বাংলা। কপিরাইট মুক্ত রিভিউ ও বিশ্লেষণ।',
          aiHashtags: ['#MovieRecap', '#FreeStudio', '#FairUse', '#BanglaMovieReview'],
          fileSizeMb: 14.8,
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed to parse database, resetting to default:', err);
    return initDB();
  }
}

let dbInstance: DatabaseSchema = initDB();

export function getDB(): DatabaseSchema {
  return dbInstance;
}

export function saveDB(): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
}
