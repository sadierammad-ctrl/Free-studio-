import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import apiRouter from './src/server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Explicitly serve manifest & service worker for PWABuilder & crawlers
app.get('/manifest.json', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});
app.get('/manifest.webmanifest', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});
app.get('/.well-known/assetlinks.json', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', '.well-known', 'assetlinks.json'));
});

// Mount FREE STUDIO core platform API (Auth, Device Binding, Subscriptions, Payments, Admin)
app.use('/api', apiRouter);

const port = Number(process.env.PORT) || 3000;

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback rule-based analyzer in case Gemini quota is limited
function generateRuleBasedAnalysis(videoType: string, changes: any, language: string = 'bn') {
  let riskScore = 85;
  const recommendations: string[] = [];
  const appliedMods: string[] = [];

  if (changes.mirror) {
    riskScore -= 15;
    appliedMods.push(language === 'bn' ? 'ভিডিও ফ্লিপ / মিরর করা হয়েছে (Visual hash পরিবর্তিত)' : 'Video flipped horizontally (Visual hash modified)');
  }
  if (changes.speed && (changes.speed > 1.03 || changes.speed < 0.97)) {
    riskScore -= 20;
    appliedMods.push(language === 'bn' ? `প্লেব্যাক স্পিড পরিবর্তন করা হয়েছে (${changes.speed}x)` : `Playback speed adjusted to ${changes.speed}x`);
  }
  if (changes.zoom && changes.zoom > 5) {
    riskScore -= 15;
    appliedMods.push(language === 'bn' ? `ফ্রেম জুম ও ক্রপ প্রয়োগ করা হয়েছে (${changes.zoom}%)` : `Frame zoom & crop applied (${changes.zoom}%)`);
  }
  if (changes.filter && changes.filter !== 'none') {
    riskScore -= 10;
    appliedMods.push(language === 'bn' ? `কালার গ্রেডিং / ফিল্টার সক্রিয়: ${changes.filter}` : `Color grading filter active: ${changes.filter}`);
  }
  if (changes.audioReplace) {
    riskScore -= 30;
    appliedMods.push(language === 'bn' ? 'কপিরাইটযুক্ত অডিও পরিবর্তন করে রয়্যালটি-ফ্রি মিউজিক যুক্ত' : 'Original audio replaced with royalty-free music');
  } else if (changes.pitchShift && Math.abs(changes.pitchShift) >= 1) {
    riskScore -= 15;
    appliedMods.push(language === 'bn' ? `অডিও পিচ শিফট পরিবর্তিত (${changes.pitchShift > 0 ? '+' : ''}${changes.pitchShift})` : `Audio pitch shifted (${changes.pitchShift})`);
  }
  if (changes.hasBorder) {
    riskScore -= 10;
    appliedMods.push(language === 'bn' ? 'ফ্রেম বর্ডার এবং ব্লার ব্যাকগ্রাউন্ড যুক্ত' : 'Frame border with blur backdrop active');
  }
  if (changes.hasWatermark || changes.hasDisclaimerOverlay) {
    riskScore -= 5;
    appliedMods.push(language === 'bn' ? 'ফেয়ার ইউজ ওয়াটারমার্ক / ব্রান্ডিং ব্যানার সংযুক্ত' : 'Fair Use disclaimer banner overlay attached');
  }

  riskScore = Math.max(5, Math.min(95, riskScore));

  let safetyRating = 'High Risk';
  if (riskScore <= 25) safetyRating = 'Safe (Fair Use Transformative)';
  else if (riskScore <= 50) safetyRating = 'Moderate Risk (Good Transformation)';
  else if (riskScore <= 75) safetyRating = 'Elevated Risk (Needs More Changes)';

  if (language === 'bn') {
    if (!changes.audioReplace && !changes.pitchShift) {
      recommendations.push('অডিও পিচ ১ সেমিটোন বৃদ্ধি করুন বা রয়্যালটি-ফ্রি অডিও দিয়ে রিপ্লেস করুন (Content ID অডিও দ্রুত ধরে)।');
    }
    if (!changes.mirror) {
      recommendations.push('ভিডিওটি অনুভূমিকভাবে মিরর (Flip) করুন যাতে পিক্সেলে ফ্রেম ম্যাচিং না হয়।');
    }
    if (!changes.zoom || changes.zoom < 5) {
      recommendations.push('ভিডিও কমপক্ষে ৫-৮% ক্রপ/জুম করুন যাতে ভিডিওর আসল রেজোলিউশন ও ওয়াটারমার্ক কেটে যায়।');
    }
    if (changes.speed === 1) {
      recommendations.push('ভিডিওর গতি ১.০৫x থেকে ১.০৮x এ পরিবর্তন করুন, যা সাধারণ দর্শকের দৃষ্টিতে স্বাভাবিক কিন্তু এআই অ্যালগরিদম ধরতে পারে না।');
    }
    recommendations.push('ভিডিওর ডেসক্রিপশনে সেকশন ১০৭ (Section 107) কপিরাইট ডিসক্লেইমার যুক্ত করুন এবং নিজের ভয়েস ওভার বা পর্যালোচনা দিন।');
  } else {
    if (!changes.audioReplace && !changes.pitchShift) {
      recommendations.push('Shift audio pitch by +1 semitone or replace with royalty-free audio (YouTube Audio Content ID is very aggressive).');
    }
    if (!changes.mirror) {
      recommendations.push('Flip the video horizontally to bypass automated frame-matching fingerprints.');
    }
    if (!changes.zoom || changes.zoom < 5) {
      recommendations.push('Zoom & crop at least 5-8% to cut edges and alter aspect coordinate hash.');
    }
    if (changes.speed === 1) {
      recommendations.push('Alter playback speed to 1.05x - 1.08x to prevent timestamp-based fingerprint matching.');
    }
    recommendations.push('Add an educational voiceover or critical commentary to qualify under legal Fair Use doctrine.');
  }

  return {
    riskScore,
    safetyRating,
    appliedMods,
    recommendations,
    fairUseVerdict: riskScore <= 35 
      ? (language === 'bn' ? 'এই ভিডিওটি যথেষ্ট রূপান্তরিত হয়েছে এবং ফেয়ার ইউজ (Fair Use) এর আওতায় ইউটিউবে প্রকাশের জন্য উপযুক্ত।' : 'This video has undergone substantial transformative alterations and meets YouTube Fair Use criteria.')
      : (language === 'bn' ? 'সতর্কতা: এখনো কপিরাইট ক্লেইমের ঝুঁকি রয়েছে। আরও রূপান্তর (যেমন অডিও পিচ বা স্পিড পরিবর্তন) প্রয়োগ করার পরামর্শ দেওয়া হচ্ছে।' : 'Caution: High probability of Content ID detection. Please apply additional audio/visual modifications.'),
  };
}

// API endpoint for AI Fair Use analysis
app.post('/api/ai/analyze-fair-use', async (req, res) => {
  try {
    const { videoType, title, appliedSettings, language = 'bn' } = req.body;

    if (ai) {
      try {
        const prompt = `You are a YouTube Copyright & Fair Use expert consultant.
Analyze this video scenario:
- Video Genre / Type: ${videoType || 'YouTube clip / re-used content'}
- Video Title / Topic: ${title || 'Transformed video'}
- Applied Transformations: ${JSON.stringify(appliedSettings)}
- User Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Evaluate the copyright risk (0-100%, where 0% is completely safe and 100% is extreme copyright strike danger).
Explain YouTube Content ID detection mechanisms (Visual fingerprint, Audio waveform fingerprint, metadata matching).
Return valid JSON format only with the following structure:
{
  "riskScore": number (0-100),
  "safetyRating": string,
  "summary": string (in requested language),
  "keyRisks": string[] (in requested language),
  "recommendedActions": string[] (in requested language),
  "contentIdBypassChecklist": [
    {"rule": string, "passed": boolean, "tip": string}
  ],
  "monetizationAdvice": string (in requested language)
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, ...parsed });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to rule engine:', geminiError?.message);
      }
    }

    // High quality fallback
    const ruleResult = generateRuleBasedAnalysis(videoType, appliedSettings || {}, language);
    return res.json({
      success: true,
      riskScore: ruleResult.riskScore,
      safetyRating: ruleResult.safetyRating,
      summary: ruleResult.fairUseVerdict,
      keyRisks: [
        language === 'bn' ? 'ইউটিউবের স্বয়ংক্রিয় কন্টেন্ট আইডি (Content ID) সিস্টেম অডিও ওয়েভফর্ম ও ভিডিও হ্যাশ ট্র্যাক করে।' : 'YouTube Content ID scans audio waveform peaks and video frame coordinate fingerprints.',
        language === 'bn' ? 'যদি ভিডিওতে কোনো অতিরিক্ত মান (ভয়েস, রিভিউ, এডিটিং) যোগ না করা হয় তবে কপিরাইট স্ট্রাইক আসতে পারে।' : 'Re-uploading raw without transformative commentary risks manual copyright strikes.',
      ],
      recommendedActions: ruleResult.recommendations,
      contentIdBypassChecklist: [
        {
          rule: language === 'bn' ? 'ভিডিও ফ্রেম মিরর / ফ্লিপিং' : 'Video Mirroring / Horizontal Inversion',
          passed: !!appliedSettings?.mirror,
          tip: language === 'bn' ? 'ভিডিওটি ফ্লিপ করলে ভিজ্যুয়াল ফিঙ্গারপ্রিন্ট ভেঙে যায়।' : 'Flips visual coordinate hash.',
        },
        {
          rule: language === 'bn' ? 'প্লেব্যাক স্পিড পরিবর্তন (১.০৪x - ১.১০x)' : 'Playback Speed Tweak (1.04x - 1.10x)',
          passed: !!(appliedSettings?.speed && appliedSettings.speed !== 1),
          tip: language === 'bn' ? 'টাইমকোড পরিবর্তন করে ফ্রেম রিকগনিশন ফাঁকি দেয়।' : 'Alters frame timing hash.',
        },
        {
          rule: language === 'bn' ? 'অডিও পিচ শিফট বা রয়্যালটি-ফ্রি অডিও' : 'Audio Pitch Shift or Royalty-Free Swap',
          passed: !!(appliedSettings?.audioReplace || (appliedSettings?.pitchShift && Math.abs(appliedSettings.pitchShift) >= 1)),
          tip: language === 'bn' ? 'অডিও ফ্রিকোয়েন্সি পরিবর্তন করে অডিও ম্যাচিং নিষ্ক্রিয় করে।' : 'Disrupts audio waveform fingerprint.',
        },
        {
          rule: language === 'bn' ? 'কালার গ্রেডিং / ফিল্টার' : 'Color Grading / Film Filter',
          passed: !!(appliedSettings?.filter && appliedSettings.filter !== 'none'),
          tip: language === 'bn' ? 'কালার প্যালেট ও স্যাচুরেশন শিফট করে।' : 'Changes RGB histogram.',
        },
        {
          rule: language === 'bn' ? 'ফেয়ার ইউজ ডিসক্লেইমার' : 'Fair Use Legal Disclaimer',
          passed: !!(appliedSettings?.hasWatermark || appliedSettings?.hasDisclaimerOverlay),
          tip: language === 'bn' ? 'আইনগত সুরক্ষা এবং পর্যালোচনা প্রমাণ হিসেবে কাজ করে।' : 'Crucial for manual dispute defense.',
        },
      ],
      monetizationAdvice: language === 'bn' 
        ? 'ইউটিউব চ্যানেলে মনিটাইজেশন পেতে সবসময় রূপান্তরমূলক নিজস্ব ভয়েসওভার, মুখমণ্ডল (Facecam) অথবা শিক্ষামূলক বিশ্লেষণ যুক্ত করুন।'
        : 'For safe channel monetization, always add your own voiceover commentary or critical educational reaction.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// API endpoint for generating Fair Use Disclaimer & Dispute Appeal templates
app.post('/api/ai/generate-disclaimer', async (req, res) => {
  try {
    const { videoTitle, channelName, originalOwner, language = 'bn' } = req.body;

    const enDisclaimer = `COPYRIGHT DISCLAIMER UNDER SECTION 107 OF THE COPYRIGHT ACT 1976:
Copyright Disclaimer Under Section 107 of the Copyright Act 1976, allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship, and research. Fair use is a use permitted by copyright statute that might otherwise be infringing. Non-profit, educational or personal use tips the balance in favor of fair use.

Video Title: ${videoTitle || 'Transformed Clip'}
Channel: ${channelName || 'Content Creator'}
Original Rights Holder: ${originalOwner || 'Respective Owners'}

All rights belong to their respective owners. No copyright infringement intended. If you are the owner and would like this video removed or credited, please contact us directly.`;

    const bnDisclaimer = `কপিরাইট আইন ১৯৭৬ এর ধারা ১০৭ এর অধীনে ফেয়ার ইউজ বিজ্ঞপ্তি:
১৯৭৬ সালের কপিরাইট আইনের ধারা ১০৭-এর অধীনে, সমালোচনা, মন্তব্য, সংবাদ প্রতিবেদন, শিক্ষাদান, বৃত্তি এবং গবেষণার মতো উদ্দেশ্যে "ন্যায্য ব্যবহার" (Fair Use) এর বিধান রয়েছে। ফেয়ার ইউজ হলো এমন একটি ব্যবহার যা কপিরাইট আইন দ্বারা অনুমোদিত যা অন্যথায় লঙ্ঘন হতে পারত। অলাভজনক, শিক্ষামূলক বা ব্যক্তিগত ব্যবহারের ক্ষেত্রে ফেয়ার ইউজ এর প্রাধান্য দেওয়া হয়।

ভিডিও শিরোনাম: ${videoTitle || 'রূপান্তরিত ভিডিও'}
চ্যানেল: ${channelName || 'ক্রিয়েটর'}
মূল স্বত্বাধিকারী: ${originalOwner || 'সংশ্লিষ্ট কর্তৃপক্ষ'}

সকল স্বত্ব মূল মালিকের সংরক্ষিত। কোনো কপিরাইট লঙ্ঘনের উদ্দেশ্য নেই। যদি আপনি মূল মালিক হন এবং ভিডিওটি সংশোধন বা সরাতে চান, দয়া করে সরাসরি যোগাযোগ করুন।`;

    const disputeAppeal = `To YouTube Copyright Team / Rights Holder:
I am writing to formally dispute the Content ID claim on my video "${videoTitle || 'Transformed Video'}".
This video constitutes a legally recognized Fair Use under Section 107 of the U.S. Copyright Act because:
1. Transformative Purpose: The content has been substantially altered with commentary, educational critique, and original transformative editing.
2. Nature of Work: Used strictly for informational/commentary purposes.
3. Market Impact: Does not compete with or replace the original work in the commercial marketplace.

Please release the claim. Thank you.`;

    return res.json({
      success: true,
      disclaimer: language === 'bn' ? bnDisclaimer : enDisclaimer,
      disclaimerEn: enDisclaimer,
      disclaimerBn: bnDisclaimer,
      disputeAppeal,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// API endpoint for AI Movie Recap & Voiceover Script generation
app.post('/api/ai/generate-movie-recap', async (req, res) => {
  try {
    const { movieTitle = 'Mystery Movie', genre = 'Action / Thriller', customContext = '', language = 'bn' } = req.body;

    if (ai) {
      try {
        const prompt = `You are a professional YouTube Movie Explainer / Recap channel scriptwriter (like "Movie Recaps", "Mystery Recapped", "Cinema Explained", "মুভি বাংলা ব্যাখ্যা").
Generate a complete, copyright-safe, engaging YouTube Movie Explainer / Recap script for:
- Movie Title / Concept: ${movieTitle}
- Genre: ${genre}
- Additional Context / Scene details: ${customContext || 'General suspenseful recap format'}
- Target Script Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}

Provide a high-retention narration script broken down into timed scenes with instructions on how to edit the clips (e.g. cut, zoom, mirror, voiceover) so YouTube's automated Content ID never flags it and human reviewers approve it under Fair Use (Section 107).

Return valid JSON strictly with this schema:
{
  "youtubeTitle": string,
  "hook": string,
  "segments": [
    {
      "timeRange": string,
      "sceneTitle": string,
      "narration": string,
      "editingDirection": string
    }
  ],
  "monetizationTips": string[],
  "fairUseStatement": string
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, ...parsed });
        }
      } catch (geminiError: any) {
        console.warn('Gemini movie recap failed, using rule-based fallback:', geminiError?.message);
      }
    }

    // High quality fallback
    const isBn = language === 'bn';
    return res.json({
      success: true,
      youtubeTitle: isBn 
        ? `এই মুভিতে এমন এক ঘটনা ঘটল যা কেউ কল্পনাও করেনি | ${movieTitle} মুভি ব্যাখ্যা (Movie Recap)` 
        : `What Happened In This Movie Will Shock You | ${movieTitle} Explained & Recapped`,
      hook: isBn 
        ? `হ্যালো বন্ধুরা! আজকের ভিডিওতে আমরা ব্যাখ্যা করব বিখ্যাত ${movieTitle} সিনেমাটি। ভিডিওর শেষ দৃশ্যটি আপনাকে হতবাক করে দেবে, তাই সম্পূর্ণ শুনুন!` 
        : `Welcome back to the channel! Today we are breaking down and explaining the movie ${movieTitle}. Watch till the end because the twist is unbelievable!`,
      segments: [
        {
          timeRange: '0:00 - 0:45',
          sceneTitle: isBn ? 'দৃশ্য ১: অদ্ভুত সূচনা' : 'Scene 1: The Mysterious Beginning',
          narration: isBn 
            ? `গল্পের শুরুতে আমরা আমাদের মূল চরিত্রকে একটি অস্বাভাবিক পরিস্থিতির মধ্যে দেখতে পাই। চারপাশের পরিবেশ সম্পূর্ণ নিস্তব্ধ এবং হঠাৎ করেই একটি অদ্ভুত ঘটনা ঘটে যা তার পুরো জীবন পাল্টে দেয়...` 
            : `The story kicks off with our protagonist trapped in an impossible situation. Out of nowhere, an unexpected event takes place that turns everything upside down...`,
          editingDirection: isBn 
            ? 'ক্লিপ ফ্লিপ (Mirror) করুন, ১.০৬x স্পিড দিন এবং মূল অডিও মিউট করে হালকা নো-কপিরাইট আবহ সঙ্গীত রাখুন।' 
            : 'Apply horizontal mirror, 1.06x speed, mute original soundtrack, and add gentle royalty-free ambient music.',
        },
        {
          timeRange: '0:45 - 2:00',
          sceneTitle: isBn ? 'দৃশ্য ২: রহস্যের অনুসন্ধান' : 'Scene 2: Uncovering The Clues',
          narration: isBn 
            ? `এরপর সে সত্য উদঘাটন করার চেষ্টা করে। কিন্তু যত গভীরে যায়, ততই বুঝতে পারে যে কেউ একজন প্রতিটি পদক্ষেপে তার ওপর নজর রাখছে। ঠিক এই সময় সে একটি গোপন সংকেত আবিষ্কার করে...` 
            : `Driven by curiosity, our hero begins searching for answers. But the deeper they dig, the clearer it becomes that someone is watching every single step...`,
          editingDirection: isBn 
            ? 'ভিডিওতে ৮% ক্রপ প্রয়োগ করে মুভির স্টুডিও ওয়াটারমার্ক কেটে ফেলুন এবং নিচে সেকশন ১০৭ ডিসক্লেইমার ব্যানার যুক্ত রাখুন।' 
            : 'Apply 8% zoom to crop broadcaster corner logos and keep the Section 107 legal banner active.',
        },
        {
          timeRange: '2:00 - 3:30',
          sceneTitle: isBn ? 'দৃশ্য ৩: চূড়ান্ত ক্লাইম্যাক্স ও মোড়' : 'Scene 3: The Climactic Twist',
          narration: isBn 
            ? `এবং অবশেষে আসে সেই কাঙ্ক্ষিত ক্লাইম্যাক্স! আসল সত্যটি যখন প্রকাশিত হয়, তখন পুরো ঘটনা সম্পূর্ণ ভিন্ন রূপ ধারণ করে। আপনার মতে মূল চরিত্রটির এই সিদ্ধান্ত কি সঠিক ছিল? কমেন্টে জানান!` 
            : `And finally, the shocking truth unravels in the climax, turning our entire perception of the storyline on its head! What would you do in this situation? Let me know in the comments below!`,
          editingDirection: isBn 
            ? 'নিজের নিজস্ব ভয়েসওভার মাইক্রোফোনে রেকর্ড করুন। এটি ইউটিউবের নজরে শতভাগ রূপান্তরমূলক (Transformative) হিসেবে গণ্য হয়।' 
            : 'Record your own voice commentary using the built-in Mic. This guarantees 100% Transformative Fair Use status.',
        },
      ],
      monetizationTips: [
        isBn ? 'কখনোই টানা ২ ঘণ্টার আস্ত মুভি হুবহু আপলোড করবেন না; ৫-১৫ মিনিটের রিক্যাপ হাইলাইটস তৈরি করুন।' : 'Never upload the raw 2-hour uncut film; create 5-15 minute recap stories.',
        isBn ? 'মুভির মূল গান ও মিউজিক মিউট রাখুন, শুধুমাত্র আপনার নিজস্ব কণ্ঠ এবং নো-কপিরাইট আবহ সঙ্গীত ব্যবহার করুন।' : 'Always mute the original studio score and replace with royalty-free tracks.',
        isBn ? 'ভিডিওতে মিরর (Mirror), ১.০৬x স্পিড ও কালার গ্রেডিং চালু রাখুন যা কন্টেন্ট আইডি বাইপাস করে।' : 'Maintain Mirror inversion, 1.06x speed multiplier, and color grading to break visual hashes.',
      ],
      fairUseStatement: isBn 
        ? 'এই রিক্যাপ স্ক্রিপ্টটি ধারা ১০৭ (Fair Use) এর অধীনে সমালোচনামূলক পর্যালোচনা ও শিক্ষামূলক ব্যাখ্যার জন্য তৈরি।' 
        : 'This recap script is legally structured under Section 107 for critical analysis and transformative review.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
});

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Vite dev middleware failed, falling back to static:', e);
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

start().catch(console.error);
