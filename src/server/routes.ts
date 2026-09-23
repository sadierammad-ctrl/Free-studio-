import express, { Request, Response } from 'express';
import { getDB, saveDB, hashPassword, StoredUser, StoredPayment, StoredPlan, StoredNotification, StoredProject } from './db.js';
import crypto from 'crypto';

const router = express.Router();

// Helper to sanitize user object (strip password hash)
function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// Check subscription expiry helper
function updateSubscriptionStatus(user: StoredUser): boolean {
  if (user.subscriptionPlan !== 'FREE' && user.subscriptionExpireAt) {
    const expireTime = new Date(user.subscriptionExpireAt).getTime();
    if (Date.now() > expireTime) {
      user.subscriptionPlan = 'FREE';
      user.subscriptionExpireAt = null;
      user.subscriptionStartAt = null;
      return true; // changed
    }
  }
  return false;
}

// ----------------------------------------------------
// 1. PUBLIC APP CONFIG & PLANS
// ----------------------------------------------------
router.get('/config', (req: Request, res: Response) => {
  const db = getDB();
  return res.json({
    success: true,
    settings: db.settings,
    plans: db.plans.filter(p => p.isAvailable),
  });
});

// ----------------------------------------------------
// 2. AUTHENTICATION & DEVICE BINDING
// ----------------------------------------------------

// Register
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const db = getDB();
    if (!db.settings.isRegistrationOpen) {
      return res.status(403).json({ error: 'নতুন রেজিস্ট্রেশন বর্তমানে বন্ধ আছে।' });
    }

    const { fullName, mobileNumber, email, password, deviceId, deviceLabel } = req.body;
    if (!fullName || !mobileNumber || !email || !password) {
      return res.status(400).json({ error: 'সবগুলো প্রয়োজনীয় ফিল্ড পূরণ করুন।' });
    }

    const cleanMobile = mobileNumber.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existing = db.users.find(u => u.mobileNumber === cleanMobile || u.email === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে।' });
    }

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: fullName.trim(),
      mobileNumber: cleanMobile,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role: 'user',
      subscriptionPlan: 'FREE',
      subscriptionStartAt: now,
      subscriptionExpireAt: null,
      videosCreatedCount: 0,
      videoLimit: db.settings.freePlanVideoLimit || 1,
      activeDeviceId: deviceId || null,
      deviceLabel: deviceLabel || 'Mobile Device',
      deviceBoundAt: deviceId ? now : null,
      isSuspended: false,
      createdAt: now,
      lastLoginAt: now,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanMobile}`,
    };

    db.users.push(newUser);

    // Welcome Notification
    db.notifications.push({
      id: 'notif_' + Date.now(),
      userId: newUser.id,
      title: 'রেজিস্ট্রেশন সফল!',
      message: `স্বাগতম ${newUser.fullName}! আপনার অ্যাকাউন্টে ১টি ফ্রি ভিডিও তৈরির সুযোগ যুক্ত হয়েছে।`,
      type: 'success',
      isRead: false,
      createdAt: now,
    });

    saveDB();
    return res.json({
      success: true,
      user: sanitizeUser(newUser),
      message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login with 1 Subscription = 1 Device Check
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const db = getDB();
    if (!db.settings.isLoginOpen) {
      return res.status(403).json({ error: 'লগইন সাময়িকভাবে স্থগিত রয়েছে।' });
    }

    const { identifier, password, deviceId, deviceLabel } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'মোবাইল/ইমেইল এবং পাসওয়ার্ড আবশ্যক।' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanId || u.mobileNumber === cleanId);
    if (!user) {
      return res.status(401).json({ error: 'ভুল মোবাইল/ইমেইল বা পাসওয়ার্ড।' });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'ভুল মোবাইল/ইমেইল বা পাসওয়ার্ড।' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।' });
    }

    // Check expiry
    const changed = updateSubscriptionStatus(user);

    // DEVICE BINDING CHECK:
    // If the user has a bound activeDeviceId and incoming deviceId is different:
    // Block simultaneous use on another device!
    const incomingDeviceId = deviceId || 'browser_dev_' + crypto.createHash('md5').update(req.headers['user-agent'] || 'def').digest('hex').substring(0, 10);

    if (user.activeDeviceId && user.activeDeviceId !== incomingDeviceId) {
      // Check if role is admin (admins can inspect multiple devices)
      if (user.role !== 'admin') {
        return res.status(403).json({
          error: 'This subscription is already active on another device.',
          errorCode: 'DEVICE_MISMATCH',
          boundDevice: user.deviceLabel || 'অন্য ডিভাইস',
          messageBn: 'এই সাবস্ক্রিপশনটি ইতোমধ্যে অন্য একটি ডিভাইসে সক্রিয় আছে। একই সাথে একাধিক ডিভাইসে ব্যবহার করা সম্ভব নয়। ডিভাইস পরিবর্তন করতে অ্যাডমিনের সাথে যোগাযোগ করুন।',
        });
      }
    }

    // If no active device bound yet, bind this first approved device
    const now = new Date().toISOString();
    if (!user.activeDeviceId) {
      user.activeDeviceId = incomingDeviceId;
      user.deviceLabel = deviceLabel || 'Android / Web Device';
      user.deviceBoundAt = now;
    }
    user.lastLoginAt = now;

    if (changed || !user.activeDeviceId) {
      saveDB();
    } else {
      saveDB();
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
      activeDeviceId: incomingDeviceId,
      message: 'লগইন সফল হয়েছে!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Get User Profile / Current Session
router.get('/user/me', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const deviceId = req.headers['x-device-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    updateSubscriptionStatus(user);
    saveDB();

    // Check device validity
    let deviceConflict = false;
    if (user.role !== 'admin' && user.activeDeviceId && deviceId && user.activeDeviceId !== deviceId) {
      deviceConflict = true;
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
      deviceConflict,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.post('/user/update-profile', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { fullName, email, mobileNumber, newPassword } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (mobileNumber) user.mobileNumber = mobileNumber.trim();
    if (newPassword && newPassword.length >= 4) {
      user.passwordHash = hashPassword(newPassword);
    }

    saveDB();
    return res.json({ success: true, user: sanitizeUser(user), message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. PAYMENT SUBMISSION (bKash & Nagad)
// ----------------------------------------------------
router.post('/payments/submit', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { planId, paymentMethod, senderNumber, transactionId } = req.body;

    if (!userId || !planId || !paymentMethod || !senderNumber || !transactionId) {
      return res.status(400).json({ error: 'সবগুলো পেমেন্ট তথ্য সঠিকভাবে প্রদান করুন।' });
    }

    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = db.plans.find(p => p.id === planId);
    if (!plan || plan.id === 'FREE') {
      return res.status(400).json({ error: 'সঠিক সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন।' });
    }

    const cleanTxn = transactionId.trim().toUpperCase();

    // Check duplicate txnId
    const duplicate = db.payments.find(p => p.transactionId === cleanTxn && p.status !== 'rejected');
    if (duplicate) {
      return res.status(400).json({ error: 'এই ট্রানজেকশন আইডি দিয়ে ইতিমধ্যে পেমেন্ট রিকোয়েস্ট জমা আছে।' });
    }

    const now = new Date().toISOString();
    const newPayment: StoredPayment = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      userName: user.fullName,
      userMobile: user.mobileNumber,
      userEmail: user.email,
      planId: plan.id,
      planName: `${plan.name} (${plan.durationText})`,
      amount: plan.price,
      paymentMethod: paymentMethod === 'Nagad' ? 'Nagad' : 'bKash',
      senderNumber: senderNumber.trim(),
      transactionId: cleanTxn,
      status: 'pending',
      createdAt: now,
    };

    db.payments.unshift(newPayment);

    // Notification for user
    db.notifications.push({
      id: 'notif_' + Date.now(),
      userId: user.id,
      title: 'পেমেন্ট ভেরিফিকেশনে জমা হয়েছে',
      message: `আপনার ${plan.name} প্ল্যানের জন্য ৳${plan.price} (${cleanTxn}) পেমেন্টটি অ্যাডমিন ভেরিফিকেশনের অপেক্ষায় আছে। ভেরিফাই হলেই স্বয়ংক্রিয়ভাবে প্ল্যান চালু হবে।`,
      type: 'info',
      isRead: false,
      createdAt: now,
    });

    saveDB();

    return res.json({
      success: true,
      payment: newPayment,
      message: 'আপনার পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন ভেরিফিকেশনের পর সাবস্ক্রিপশন চালু হবে।',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment submit failed' });
  }
});

// User Payment History
router.get('/payments/my-history', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDB();
    const userPayments = db.payments.filter(p => p.userId === userId);
    return res.json({ success: true, payments: userPayments });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. VIDEO CREATION & USAGE CHECK
// ----------------------------------------------------
router.post('/videos/check-limit', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const deviceId = req.headers['x-device-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'লগইন করুন।' });
    }

    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    updateSubscriptionStatus(user);

    // Device Authorization Check
    if (user.role !== 'admin' && user.activeDeviceId && deviceId && user.activeDeviceId !== deviceId) {
      return res.status(403).json({
        allowed: false,
        error: 'This subscription is already active on another device.',
        boundDevice: user.deviceLabel || 'অন্য ডিভাইস',
      });
    }

    // Limit check for FREE plan
    if (user.subscriptionPlan === 'FREE') {
      const freeLimit = db.settings.freePlanVideoLimit || 1;
      if (user.videosCreatedCount >= freeLimit) {
        return res.status(403).json({
          allowed: false,
          error: 'Your free video limit has been used. Upgrade your plan to create more videos.',
          limitReached: true,
          plan: 'FREE',
          used: user.videosCreatedCount,
          limit: freeLimit,
        });
      }
    }

    return res.json({
      allowed: true,
      plan: user.subscriptionPlan,
      used: user.videosCreatedCount,
      limit: user.videoLimit,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Record new video creation
router.post('/videos/save-project', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { title, videoUrl, thumbnailUrl, durationSeconds, settings, aiTitle, aiCaption, aiHashtags, aiScript, fileSizeMb } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Enforce limits
    if (user.subscriptionPlan === 'FREE') {
      const freeLimit = db.settings.freePlanVideoLimit || 1;
      if (user.videosCreatedCount >= freeLimit) {
        return res.status(403).json({
          error: 'Your free video limit has been used. Upgrade your plan to create more videos.',
          limitReached: true,
        });
      }
    }

    user.videosCreatedCount += 1;

    const newProject: StoredProject = {
      id: 'proj_' + Date.now(),
      userId: user.id,
      title: title || 'নতুন এআই ভিডিও প্রজেক্ট',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      videoUrl: videoUrl || '',
      durationSeconds: durationSeconds || 30,
      status: 'completed',
      createdAt: new Date().toISOString(),
      settings: settings || {},
      aiTitle,
      aiCaption,
      aiHashtags,
      aiScript,
      fileSizeMb: fileSizeMb || 12.5,
    };

    db.projects.unshift(newProject);
    saveDB();

    return res.json({
      success: true,
      project: newProject,
      videosCreatedCount: user.videosCreatedCount,
      message: 'ভিডিও প্রজেক্ট সফলভাবে প্রস্তুত ও সেভ হয়েছে!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get user videos
router.get('/videos/my-videos', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const db = getDB();
    const projects = db.projects.filter(p => p.userId === userId);
    return res.json({ success: true, projects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete user video
router.delete('/videos/:id', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;
    const db = getDB();
    const index = db.projects.findIndex(p => p.id === id && p.userId === userId);
    if (index === -1) return res.status(404).json({ error: 'Video not found' });

    db.projects.splice(index, 1);
    saveDB();
    return res.json({ success: true, message: 'ভিডিওটি মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. NOTIFICATIONS
// ----------------------------------------------------
router.get('/notifications', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const db = getDB();
    const notifs = db.notifications.filter(n => n.userId === 'all' || n.userId === userId);
    return res.json({ success: true, notifications: notifs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/notifications/mark-all-read', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const db = getDB();
    db.notifications.forEach(n => {
      if (n.userId === 'all' || n.userId === userId) {
        n.isRead = true;
      }
    });
    saveDB();
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 6. ADMIN PANEL APIS
// ----------------------------------------------------

// Admin middleware check
function requireAdmin(req: Request, res: Response, next: () => void) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'অ্যাডমিন অধিকার প্রয়োজন।' });
  }
  next();
}

// Admin Stats
router.get('/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();

  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => !u.isSuspended).length;
  const freeUsers = db.users.filter(u => u.subscriptionPlan === 'FREE').length;
  const goUsers = db.users.filter(u => u.subscriptionPlan === 'GO').length;
  const plusUsers = db.users.filter(u => u.subscriptionPlan === 'PLUS').length;
  const proUsers = db.users.filter(u => u.subscriptionPlan === 'PRO').length;
  const maxUsers = db.users.filter(u => u.subscriptionPlan === 'MAX').length;

  const pendingPayments = db.payments.filter(p => p.status === 'pending').length;
  const approvedPayments = db.payments.filter(p => p.status === 'approved').length;
  const rejectedPayments = db.payments.filter(p => p.status === 'rejected').length;

  const totalRevenue = db.payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const activeDevices = db.users.filter(u => !!u.activeDeviceId).length;

  return res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      freeUsers,
      goUsers,
      plusUsers,
      proUsers,
      maxUsers,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue,
      activeDevices,
    },
  });
});

// Admin Users List
router.get('/admin/users', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  const users = db.users.map(sanitizeUser);
  return res.json({ success: true, users });
});

// Admin User Actions
router.post('/admin/users/:id/action', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, payload } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date().toISOString();

    if (action === 'suspend') {
      user.isSuspended = true;
    } else if (action === 'activate') {
      user.isSuspended = false;
    } else if (action === 'reset_device') {
      user.activeDeviceId = null;
      user.deviceLabel = null;
      user.deviceBoundAt = null;

      db.notifications.push({
        id: 'notif_' + Date.now(),
        userId: user.id,
        title: 'ডিভাইস রিসেট করা হয়েছে',
        message: 'অ্যাডমিন আপনার সক্রিয় ডিভাইসটি রিসেট করেছেন। আপনি এখন নতুন ফোনে লগইন করতে পারবেন।',
        type: 'info',
        isRead: false,
        createdAt: now,
      });
    } else if (action === 'change_subscription') {
      const planId = payload?.planId;
      const plan = db.plans.find(p => p.id === planId);
      if (plan) {
        user.subscriptionPlan = plan.id;
        user.subscriptionStartAt = now;
        if (plan.durationDays > 0) {
          user.subscriptionExpireAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
        } else {
          user.subscriptionExpireAt = null;
        }
        user.videoLimit = plan.videoLimit;

        db.notifications.push({
          id: 'notif_' + Date.now(),
          userId: user.id,
          title: 'সাবস্ক্রিপশন আপডেট হয়েছে',
          message: `আপনার সাবস্ক্রিপশন প্ল্যান পরিবর্তন করে ${plan.name} করা হয়েছে।`,
          type: 'success',
          isRead: false,
          createdAt: now,
        });
      }
    } else if (action === 'extend_subscription') {
      const days = Number(payload?.days) || 30;
      const currentExpire = user.subscriptionExpireAt ? new Date(user.subscriptionExpireAt).getTime() : Date.now();
      const newExpire = new Date(Math.max(Date.now(), currentExpire) + days * 24 * 60 * 60 * 1000).toISOString();
      user.subscriptionExpireAt = newExpire;
    } else if (action === 'cancel_subscription') {
      user.subscriptionPlan = 'FREE';
      user.subscriptionStartAt = now;
      user.subscriptionExpireAt = null;
      user.videoLimit = db.settings.freePlanVideoLimit || 1;
    } else if (action === 'reset_password') {
      const newPass = payload?.password || '123456';
      user.passwordHash = hashPassword(newPass);
    } else if (action === 'delete') {
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) db.users.splice(idx, 1);
    }

    saveDB();
    return res.json({ success: true, user: sanitizeUser(user), message: 'অ্যাকশন সফলভাবে সম্পন্ন হয়েছে!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Payments List
router.get('/admin/payments', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  return res.json({ success: true, payments: db.payments });
});

// Admin Payment Approve / Reject
router.post('/admin/payments/:id/verify', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body; // 'approve' | 'reject'
    const db = getDB();
    const payment = db.payments.find(p => p.id === id);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'এই পেমেন্টটি ইতিমধ্যে প্রসেস করা হয়েছে।' });
    }

    const now = new Date().toISOString();
    const user = db.users.find(u => u.id === payment.userId);
    const plan = db.plans.find(p => p.id === payment.planId);

    if (action === 'approve') {
      payment.status = 'approved';
      payment.verifiedAt = now;
      payment.verifiedBy = 'Admin';
      payment.adminNote = adminNote || 'পেমেন্ট সত্যতা যাচাই করে প্ল্যান সক্রিয় করা হয়েছে।';

      if (user && plan) {
        user.subscriptionPlan = plan.id;
        user.subscriptionStartAt = now;
        if (plan.durationDays > 0) {
          user.subscriptionExpireAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
        } else {
          user.subscriptionExpireAt = null;
        }
        user.videoLimit = plan.videoLimit;

        // Auto notification to user
        db.notifications.push({
          id: 'notif_' + Date.now(),
          userId: user.id,
          title: `🎉 ${plan.name} সাবস্ক্রিপশন সক্রিয় হয়েছে!`,
          message: `আপনার ৳${payment.amount} (${payment.paymentMethod}) পেমেন্ট অনুমোদিত হয়েছে। মেয়াদ: ${user.subscriptionExpireAt ? new Date(user.subscriptionExpireAt).toLocaleDateString('bn-BD') : 'আজীবন'} পর্যন্ত।`,
          type: 'success',
          isRead: false,
          createdAt: now,
        });
      }
    } else {
      payment.status = 'rejected';
      payment.verifiedAt = now;
      payment.verifiedBy = 'Admin';
      payment.adminNote = adminNote || 'ভুল ট্রানজেকশন আইডি অথবা টাকা পৌঁছায়নি।';

      if (user) {
        db.notifications.push({
          id: 'notif_' + Date.now(),
          userId: user.id,
          title: `পেমেন্ট বাতিল হয়েছে`,
          message: `আপনার পেমেন্টটি অ্যাডমিন দ্বারা বাতিল হয়েছে। কারণ: ${payment.adminNote}`,
          type: 'error',
          isRead: false,
          createdAt: now,
        });
      }
    }

    saveDB();
    return res.json({ success: true, payment, message: action === 'approve' ? 'পেমেন্ট অনুমোদিত এবং প্ল্যান চালু হয়েছে!' : 'পেমেন্ট বাতিল করা হয়েছে।' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Plans Control (update price, limits, duration, etc.)
router.get('/admin/plans', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  return res.json({ success: true, plans: db.plans });
});

router.post('/admin/plans/update', requireAdmin, (req: Request, res: Response) => {
  try {
    const { plans } = req.body;
    if (!Array.isArray(plans)) return res.status(400).json({ error: 'Invalid plans payload' });

    const db = getDB();
    db.plans = plans;
    saveDB();
    return res.json({ success: true, plans: db.plans, message: 'প্ল্যানসমূহ সফলভাবে আপডেট হয়েছে!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin App Settings Control
router.get('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const db = getDB();
  return res.json({ success: true, settings: db.settings });
});

router.post('/admin/settings/update', requireAdmin, (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings) return res.status(400).json({ error: 'Settings payload required' });

    const db = getDB();
    db.settings = { ...db.settings, ...settings };
    saveDB();
    return res.json({ success: true, settings: db.settings, message: 'অ্যাপ সেটিংস সফলভাবে আপডেট হয়েছে!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
