import { categoryIcons } from '@/shared/constants';
import type { Category } from '@/shared/types';

// Order matters: it's the order categories appear in. Creative media first (video, music, fonts, graphics, photos).
export const mockCategories: Omit<Category, 'itemCount'>[] = [
  { id: 'videoTemplates', icon: categoryIcons.videoTemplates, accent: 'royalBlue', keywords: ['video', 'template', 'after effects', 'premiere', 'فيديو', 'قوالب'] },
  { id: 'stockVideo', icon: categoryIcons.stockVideo, accent: 'black', keywords: ['footage', 'stock', 'clip', 'فيديو', 'مشاهد'] },
  { id: 'music', icon: categoryIcons.music, accent: 'lime', keywords: ['music', 'song', 'track', 'audio', 'موسيقى', 'مزيكا', 'mazika'] },
  { id: 'soundEffects', icon: categoryIcons.soundEffects, accent: 'royalBlue', keywords: ['sfx', 'sound', 'effect', 'audio', 'مؤثرات', 'صوت'] },
  { id: 'fonts', icon: categoryIcons.fonts, accent: 'black', keywords: ['font', 'typeface', 'خط', 'خطوط', '5at'] },
  { id: 'graphics', icon: categoryIcons.graphics, accent: 'lime', keywords: ['vector', 'illustration', 'icon', 'رسومات', 'جرافيك'] },
  { id: 'graphicTemplates', icon: categoryIcons.graphicTemplates, accent: 'royalBlue', keywords: ['template', 'photoshop', 'illustrator', 'تصميم', 'قوالب'] },
  { id: 'photos', icon: categoryIcons.photos, accent: 'black', keywords: ['photo', 'image', 'picture', 'صور', 'صورة', 'sora'] },
  { id: 'presentationTemplates', icon: categoryIcons.presentationTemplates, accent: 'lime', keywords: ['slides', 'powerpoint', 'keynote', 'عرض', 'بوربوينت'] },
  { id: 'webTemplates', icon: categoryIcons.webTemplates, accent: 'royalBlue', keywords: ['website', 'html', 'landing', 'موقع', 'ويب'] },
];
