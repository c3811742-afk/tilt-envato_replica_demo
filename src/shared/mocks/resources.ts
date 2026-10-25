import type { BlogPost, Course, Job, NewsPost } from '@/shared/types';

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'ramadan-campaign-ideas',
    topic: 'design',
    title: { en: 'Ramadan campaign ideas that still feel fresh', ar: 'أفكار لحملات رمضان ما زالت مختلفة' },
    summary: { en: 'Five directions for posts, banners and short videos this season.', ar: 'خمسة اتجاهات للمنشورات واللافتات والفيديوهات القصيرة هذا الموسم.' },
    body: {
      en: [
        'Lanterns and crescents are everywhere in Ramadan. To stand out, start from what your audience actually does during the month: late family dinners, night walks, last-minute gifts.',
        'Pick one moment and build the whole campaign around it. Keep the palette small and let one strong photo or illustration carry each post.',
        'Short vertical videos work best when the first second already shows the moment. Add bilingual captions so the post reads well with the sound off.',
      ],
      ar: [
        'الفوانيس والأهلّة في كل مكان خلال رمضان. لتتميز، ابدأ مما يفعله جمهورك فعلًا في الشهر: السحور مع العائلة، والتمشية ليلًا، وشراء الهدايا في آخر لحظة.',
        'اختر لحظة واحدة وابنِ الحملة كلها حولها. اجعل الألوان قليلة، ودع صورة أو رسمًا قويًا يحمل كل منشور.',
        'الفيديوهات الرأسية القصيرة تنجح أكثر عندما تظهر اللحظة من أول ثانية. أضف ترجمة بلغتين حتى يُفهم المنشور بدون صوت.',
      ],
    },
    author: 'Mariam Adel',
    publishedAt: '2026-09-28',
    readMinutes: 4,
    accent: 'royalBlue',
  },
  {
    id: 'editing-reels-faster',
    topic: 'video',
    title: { en: 'Edit reels faster with templates', ar: 'عدّل الريلز أسرع باستخدام القوالب' },
    summary: { en: 'How to swap text, photos and music in a video template in minutes.', ar: 'كيف تغيّر النصوص والصور والموسيقى في قالب فيديو خلال دقائق.' },
    body: {
      en: [
        'A good video template already has the timing, transitions and text animation done. Your job is to replace the content, not rebuild it.',
        'Open the project, replace the placeholder text first, then drop your photos and clips into the marked layers. Change colors from the control layer if the template has one.',
        'Export a short test first. Check that the text is readable on a phone before you export the final version.',
      ],
      ar: [
        'قالب الفيديو الجيد يكون فيه التوقيت والانتقالات وحركة النصوص جاهزة. مهمتك أن تستبدل المحتوى، لا أن تعيد بناءه.',
        'افتح المشروع، واستبدل النصوص أولًا، ثم ضع صورك ومقاطعك في الطبقات المحددة. غيّر الألوان من طبقة التحكم إذا كانت موجودة.',
        'صدّر نسخة قصيرة للتجربة أولًا، وتأكد أن النص مقروء على الموبايل قبل تصدير النسخة النهائية.',
      ],
    },
    author: 'Karim Fathy',
    publishedAt: '2026-09-14',
    readMinutes: 5,
    accent: 'lime',
  },
  {
    id: 'music-for-brand-videos',
    topic: 'music',
    title: { en: 'Choosing music for a brand video', ar: 'اختيار الموسيقى لفيديو علامة تجارية' },
    summary: { en: 'Match the tempo, mood and length to your edit.', ar: 'اختر السرعة والحالة والمدة المناسبة لمونتاجك.' },
    body: {
      en: [
        'Start with the mood you want people to feel, not a genre. Then filter by tempo: slower for calm product shots, faster for quick cuts.',
        'Look for tracks with alternate versions. A 30 or 60 second edit saves you from cutting the music yourself.',
        'If the video goes on YouTube, add your channel in Licensing settings before you download the track.',
      ],
      ar: [
        'ابدأ بالإحساس الذي تريد أن يشعر به الناس، لا بنوع الموسيقى. ثم اختر السرعة: أبطأ للقطات المنتج الهادئة، وأسرع للقطات المتلاحقة.',
        'ابحث عن مقاطع لها نسخ بديلة. نسخة 30 أو 60 ثانية توفر عليك قص الموسيقى بنفسك.',
        'إذا كان الفيديو سيُنشر على يوتيوب، أضف قناتك في إعدادات التراخيص قبل تنزيل المقطع.',
      ],
    },
    author: 'Nour Hassan',
    publishedAt: '2026-08-30',
    readMinutes: 3,
    accent: 'royalBlue',
  },
  {
    id: 'pricing-freelance-design',
    topic: 'business',
    title: { en: 'Pricing your freelance design work', ar: 'تسعير أعمالك كمصمم مستقل' },
    summary: { en: 'A simple way to quote projects without underselling yourself.', ar: 'طريقة بسيطة لتسعير المشروعات دون أن تبخس حقك.' },
    body: {
      en: [
        'Estimate the hours, add time for revisions and calls, then multiply by your hourly rate. Quote the project, not the hours.',
        'List what is included: the number of designs, revisions and file formats. Anything extra is a new quote.',
        'Include the cost of assets you license for the client, and keep the license certificates with the project files.',
      ],
      ar: [
        'قدّر عدد الساعات، وأضف وقتًا للتعديلات والمكالمات، ثم اضربها في سعر الساعة. سعّر المشروع لا الساعات.',
        'اكتب ما يتضمنه السعر: عدد التصميمات والتعديلات وصيغ الملفات. أي شيء إضافي له سعر جديد.',
        'أضف تكلفة العناصر التي ترخّصها للعميل، واحتفظ بشهادات الترخيص مع ملفات المشروع.',
      ],
    },
    author: 'Youssef Samir',
    publishedAt: '2026-08-11',
    readMinutes: 6,
    accent: 'lime',
  },
  {
    id: 'ai-studio-launch',
    topic: 'news',
    title: { en: 'AI Studio is here', ar: 'استوديو الذكاء الاصطناعي متاح الآن' },
    summary: { en: 'Images, edits, video and audio from a description, included in every plan.', ar: 'صور وتعديلات وفيديو وصوت من وصفك، متاحة في كل باقة.' },
    body: {
      en: [
        'Every plan now includes monthly AI credits. Make images, edit your own photos, create short videos, music, voice-overs in Arabic and English, and sound effects.',
        'Everything you generate comes with a license, so you can use it in client work like any item from the library.',
      ],
      ar: [
        'كل باقة تتضمن الآن أرصدة شهرية للذكاء الاصطناعي. اصنع صورًا، وعدّل صورك، وأنشئ فيديوهات قصيرة وموسيقى وتعليقًا صوتيًا بالعربية والإنجليزية ومؤثرات صوتية.',
        'كل ما تنشئه يأتي بترخيص، فيمكنك استخدامه في أعمال العملاء مثل أي عنصر من المكتبة.',
      ],
    },
    author: 'TILT',
    publishedAt: '2026-10-01',
    readMinutes: 2,
    accent: 'royalBlue',
  },
  {
    id: 'arabic-typography-basics',
    topic: 'design',
    title: { en: 'Arabic typography basics', ar: 'أساسيات الخط العربي في التصميم' },
    summary: { en: 'Pairing Arabic and Latin fonts that work together.', ar: 'كيف تختار خطوطًا عربية ولاتينية تتناسب معًا.' },
    body: {
      en: [
        'Pick the Arabic font first. Arabic letters need more height, so a pairing that looks balanced in Latin can feel small in Arabic.',
        'Match the weight and the mood: a geometric Latin font pairs well with a geometric Kufi, a humanist one with a Naskh.',
        'Never stretch Arabic letters to fill a line, and avoid letter spacing on Arabic text.',
      ],
      ar: [
        'اختر الخط العربي أولًا. الحروف العربية تحتاج ارتفاعًا أكبر، فالخط الذي يبدو متوازنًا باللاتينية قد يبدو صغيرًا بالعربية.',
        'طابق السُمك والطابع: الخط اللاتيني الهندسي يناسبه الكوفي الهندسي، والخط الإنساني يناسبه النسخ.',
        'لا تمط الحروف العربية لملء السطر، وتجنب المسافات بين الحروف في النص العربي.',
      ],
    },
    author: 'Salma Mostafa',
    publishedAt: '2026-07-20',
    readMinutes: 5,
    accent: 'lime',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'motion-graphics-start',
    kind: 'course',
    level: 'beginner',
    title: { en: 'Motion graphics from scratch', ar: 'الموشن جرافيك من الصفر' },
    summary: { en: 'Animate text and shapes and edit video templates with confidence.', ar: 'حرّك النصوص والأشكال وعدّل قوالب الفيديو بثقة.' },
    instructor: 'Karim Fathy',
    lessons: [
      { title: { en: 'Your first animation', ar: 'أول حركة لك' }, minutes: 12 },
      { title: { en: 'Keyframes and easing', ar: 'الإطارات المفتاحية والتسارع' }, minutes: 15 },
      { title: { en: 'Editing a template', ar: 'تعديل قالب' }, minutes: 18 },
      { title: { en: 'Exporting for social media', ar: 'التصدير للسوشيال ميديا' }, minutes: 10 },
    ],
    accent: 'royalBlue',
  },
  {
    id: 'brand-identity',
    kind: 'course',
    level: 'intermediate',
    title: { en: 'Building a brand identity', ar: 'بناء هوية بصرية' },
    summary: { en: 'Logo, colors, type and a simple brand guide for a small business.', ar: 'الشعار والألوان والخطوط ودليل هوية بسيط لمشروع صغير.' },
    instructor: 'Salma Mostafa',
    lessons: [
      { title: { en: 'Understanding the brief', ar: 'فهم المطلوب' }, minutes: 14 },
      { title: { en: 'Logo sketches', ar: 'رسومات الشعار الأولى' }, minutes: 20 },
      { title: { en: 'Color and type', ar: 'الألوان والخطوط' }, minutes: 16 },
      { title: { en: 'The brand guide', ar: 'دليل الهوية' }, minutes: 12 },
    ],
    accent: 'lime',
  },
  {
    id: 'color-grading-tutorial',
    kind: 'tutorial',
    level: 'intermediate',
    title: { en: 'Color grading a short film', ar: 'تصحيح ألوان فيلم قصير' },
    summary: { en: 'A warm, consistent look across every shot.', ar: 'مظهر دافئ ومتناسق في كل اللقطات.' },
    instructor: 'Omar Nabil',
    lessons: [{ title: { en: 'Grading step by step', ar: 'التصحيح خطوة بخطوة' }, minutes: 22 }],
    accent: 'royalBlue',
  },
  {
    id: 'podcast-sound-tutorial',
    kind: 'tutorial',
    level: 'beginner',
    title: { en: 'Clean sound for your podcast', ar: 'صوت نقي لبودكاستك' },
    summary: { en: 'Record, clean up and add music and sound effects.', ar: 'سجّل ونظّف الصوت وأضف موسيقى ومؤثرات.' },
    instructor: 'Nour Hassan',
    lessons: [{ title: { en: 'From recording to final mix', ar: 'من التسجيل إلى المزج النهائي' }, minutes: 18 }],
    accent: 'lime',
  },
];

export const mockJobs: Job[] = [
  {
    id: 'frontend-engineer',
    team: 'engineering',
    title: { en: 'Frontend engineer', ar: 'مهندس واجهات أمامية' },
    location: { en: 'Cairo', ar: 'القاهرة' },
    remote: true,
    summary: { en: 'Build the pages creators and customers use every day.', ar: 'ابنِ الصفحات التي يستخدمها المصممون والعملاء كل يوم.' },
  },
  {
    id: 'product-designer',
    team: 'design',
    title: { en: 'Product designer', ar: 'مصمم منتجات' },
    location: { en: 'Cairo', ar: 'القاهرة' },
    remote: false,
    summary: { en: 'Design search, licensing and AI Studio in Arabic and English.', ar: 'صمّم البحث والتراخيص واستوديو الذكاء الاصطناعي بالعربية والإنجليزية.' },
  },
  {
    id: 'content-curator',
    team: 'content',
    title: { en: 'Content reviewer', ar: 'مراجع محتوى' },
    location: { en: 'Alexandria', ar: 'الإسكندرية' },
    remote: true,
    summary: { en: 'Review new items before they go live and pick the free items of the month.', ar: 'راجع العناصر الجديدة قبل نشرها واختر العناصر المجانية لكل شهر.' },
  },
  {
    id: 'support-specialist',
    team: 'support',
    title: { en: 'Customer support specialist', ar: 'أخصائي دعم العملاء' },
    location: { en: 'Cairo', ar: 'القاهرة' },
    remote: true,
    summary: { en: 'Help customers with downloads, licenses and billing.', ar: 'ساعد العملاء في التنزيلات والتراخيص والفواتير.' },
  },
];

export const mockNews: NewsPost[] = [
  {
    id: 'ai-studio',
    title: { en: 'TILT launches AI Studio', ar: 'TILT تطلق استوديو الذكاء الاصطناعي' },
    summary: { en: 'Every plan now includes monthly AI credits for images, video and audio.', ar: 'كل باقة تتضمن الآن أرصدة شهرية للصور والفيديو والصوت.' },
    publishedAt: '2026-10-01',
  },
  {
    id: 'teams-plan',
    title: { en: 'A new plan for teams and classes', ar: 'باقة جديدة للفرق والفصول الدراسية' },
    summary: { en: 'One bill, shared licenses and shared collections for every seat.', ar: 'فاتورة واحدة وتراخيص ومجموعات مشتركة لكل المقاعد.' },
    publishedAt: '2026-09-15',
  },
  {
    id: 'local-payments',
    title: { en: 'Pay with mobile wallets, InstaPay and Fawry', ar: 'ادفع بالمحافظ الإلكترونية وإنستاباي وفوري' },
    summary: { en: 'More ways to pay, and installments on yearly plans.', ar: 'طرق دفع أكثر، وتقسيط للباقات السنوية.' },
    publishedAt: '2026-08-20',
  },
  {
    id: 'ten-thousand-items',
    title: { en: 'The library passes 10,000 items', ar: 'المكتبة تتجاوز 10,000 عنصر' },
    summary: { en: 'Thanks to the creators who publish with us every week.', ar: 'شكرًا للمصممين الذين ينشرون معنا كل أسبوع.' },
    publishedAt: '2026-07-05',
  },
];
