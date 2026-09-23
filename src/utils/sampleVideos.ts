export interface SampleVideo {
  id: string;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  categoryEn: string;
  duration: string;
  url: string;
  thumbnail: string;
  mockCopyrightOwner: string;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: 'sample-action',
    titleBn: 'অ্যাকশন সিনেমা ট্রেলার (মুভি ক্লিপ)',
    titleEn: 'Cinematic Action Movie Trailer',
    categoryBn: 'মুভি ক্লিপ / রিভিউ',
    categoryEn: 'Movie Clips / Review',
    duration: '0:30',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    mockCopyrightOwner: 'Blender Foundation / Studio Content ID',
  },
  {
    id: 'sample-nature',
    titleBn: 'ওয়াইল্ডলাইফ ও প্রকৃতি তথ্যচিত্র',
    titleEn: 'Wildlife Nature Documentary',
    categoryBn: 'তথ্যচিত্র / শিক্ষামূলক',
    categoryEn: 'Documentary / Edu',
    duration: '0:15',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    mockCopyrightOwner: 'National Media Corp Content ID',
  },
  {
    id: 'sample-tech',
    titleBn: 'টেক গ্যাজেট ও রিভিউ ক্লিপ',
    titleEn: 'Tech Gadget Review Clip',
    categoryBn: 'টেক / গ্যাজেট',
    categoryEn: 'Tech / Gadget',
    duration: '0:15',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    mockCopyrightOwner: 'Global Tech Reviews Ltd',
  },
];
