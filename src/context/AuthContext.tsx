import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, AppSettings, PlanConfig, AppNotification } from '../types';
import { getOrCreateDeviceId } from '../utils/device';

interface AuthContextType {
  user: AppUser | null;
  settings: AppSettings | null;
  plans: PlanConfig[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  isLoading: boolean;
  deviceInfo: { deviceId: string; deviceLabel: string };
  deviceConflict: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; boundDevice?: string }>;
  register: (fullName: string, mobileNumber: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  canCreateVideo: () => { allowed: boolean; reason?: string; limitReached?: boolean };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceConflict, setDeviceConflict] = useState(false);

  const deviceInfo = getOrCreateDeviceId();

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setPlans(data.plans);
      }
    } catch (e) {
      console.error('Config fetch failed:', e);
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/user/me', {
        headers: {
          'x-user-id': userId,
          'x-device-id': deviceInfo.deviceId,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setDeviceConflict(!!data.deviceConflict);
      } else {
        localStorage.removeItem('fs_user_id');
        setUser(null);
      }
    } catch (e) {
      console.error('User fetch failed:', e);
    }
  };

  const fetchNotifications = async () => {
    const userId = user?.id || localStorage.getItem('fs_user_id');
    if (!userId) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Notifications fetch failed:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchConfig();
      const storedUserId = localStorage.getItem('fs_user_id');
      if (storedUserId) {
        await fetchUser(storedUserId);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // live updates
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          deviceId: deviceInfo.deviceId,
          deviceLabel: deviceInfo.deviceLabel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('fs_user_id', data.user.id);
        setDeviceConflict(false);
        await fetchNotifications();
        return { success: true };
      } else {
        return {
          success: false,
          error: data.messageBn || data.error || 'লগইন ব্যর্থ হয়েছে।',
          boundDevice: data.boundDevice,
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'নেটওয়ার্ক সমস্যা।' };
    }
  };

  const register = async (fullName: string, mobileNumber: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          email,
          password,
          deviceId: deviceInfo.deviceId,
          deviceLabel: deviceInfo.deviceLabel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('fs_user_id', data.user.id);
        await fetchNotifications();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'নেটওয়ার্ক সমস্যা।' };
    }
  };

  const logout = () => {
    localStorage.removeItem('fs_user_id');
    setUser(null);
    setNotifications([]);
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'x-user-id': user.id },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const canCreateVideo = () => {
    if (!user) return { allowed: false, reason: 'দয়া করে লগইন করুন।' };
    if (deviceConflict) {
      return { allowed: false, reason: 'এই সাবস্ক্রিপশনটি অন্য ডিভাইসে সক্রিয় আছে।' };
    }
    if (user.subscriptionPlan === 'FREE') {
      const limit = settings?.freePlanVideoLimit || 1;
      if (user.videosCreatedCount >= limit) {
        return {
          allowed: false,
          limitReached: true,
          reason: 'Your free video limit has been used. Upgrade your plan to create more videos.',
        };
      }
    }
    return { allowed: true };
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        plans,
        notifications,
        unreadNotifsCount,
        isLoading,
        deviceInfo,
        deviceConflict,
        login,
        register,
        logout,
        refreshUser: () => (user ? fetchUser(user.id) : Promise.resolve()),
        refreshConfig: fetchConfig,
        refreshNotifications: fetchNotifications,
        markAllNotificationsRead,
        canCreateVideo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
