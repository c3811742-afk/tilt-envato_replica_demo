import type { HelpArticle, LearnGuide } from '@/shared/types';

// Help Center articles, two for each topic.
export const mockHelpArticles: HelpArticle[] = [
  {
    id: 'what-a-license-covers',
    topic: 'licensing',
    title: { en: 'What a license covers', ar: 'ما يغطيه الترخيص' },
    summary: { en: 'Each download is licensed for one project.', ar: 'كل تنزيل مرخّص لمشروع واحد.' },
    body: {
      en: [
        'Every time you download an item, you name the project it is for. The license lets you use the item in that one project, for personal or commercial work.',
        'You can edit the item and combine it with your own work. You can keep using it in that project after your plan ends.',
        'To use the same item in another project, download it again with the new project name. It counts as a new download.',
      ],
      ar: [
        'في كل مرة تنزّل فيها عنصرًا، تكتب اسم المشروع الذي ستستخدمه فيه. يسمح لك الترخيص باستخدام العنصر في هذا المشروع فقط، لعمل شخصي أو تجاري.',
        'يمكنك تعديل العنصر ودمجه مع عملك، ويمكنك الاستمرار في استخدامه في هذا المشروع بعد انتهاء باقتك.',
        'لاستخدام العنصر نفسه في مشروع آخر، نزّله مرة أخرى باسم المشروع الجديد. يُحسب ذلك تنزيلًا جديدًا.',
      ],
    },
  },
  {
    id: 'youtube-claims',
    topic: 'licensing',
    title: { en: 'Clearing a YouTube claim on music', ar: 'إزالة مطالبة يوتيوب على الموسيقى' },
    summary: { en: 'Add your channel and send a proof-of-license letter.', ar: 'أضف قناتك وأرسل خطاب إثبات الترخيص.' },
    body: {
      en: [
        'Add your YouTube channels in Account settings, under Licensing. Music you license afterwards is cleared for those channels.',
        'If a video still gets a claim, open Downloads and licenses, find the track and select Proof of license. Send the letter to YouTube when you dispute the claim.',
      ],
      ar: [
        'أضف قنواتك على يوتيوب من إعدادات الحساب، في قسم التراخيص. الموسيقى التي ترخّصها بعد ذلك تكون مرخّصة لهذه القنوات.',
        'إذا ظهرت مطالبة على فيديو، افتح التنزيلات والتراخيص، وابحث عن المقطع واختر إثبات الترخيص. أرسل الخطاب إلى يوتيوب عند الاعتراض على المطالبة.',
      ],
    },
  },
  {
    id: 'create-collections',
    topic: 'collections',
    title: { en: 'Creating and sharing collections', ar: 'إنشاء المجموعات ومشاركتها' },
    summary: { en: 'Group items and your own files, and share them by link.', ar: 'جمّع العناصر وملفاتك وشاركها برابط.' },
    body: {
      en: [
        'Select the folder button on any item to save it to a collection, or create a new one from My collections. Collections can hold other collections, up to three levels deep.',
        'Open a collection and select Share to get a link. Anyone with the link can view it. Turn sharing off at any time to stop the link working.',
      ],
      ar: [
        'اضغط زر المجلد في أي عنصر لحفظه في مجموعة، أو أنشئ مجموعة جديدة من مجموعاتي. يمكن أن تحتوي المجموعة على مجموعات أخرى حتى ثلاثة مستويات.',
        'افتح المجموعة واختر مشاركة للحصول على رابط. يمكن لأي شخص لديه الرابط عرضها، ويمكنك إيقاف المشاركة في أي وقت.',
      ],
    },
  },
  {
    id: 'team-collections',
    topic: 'collections',
    title: { en: 'Collections for your team', ar: 'مجموعات الفريق' },
    summary: { en: 'Everyone on a Teams plan can view and add to team collections.', ar: 'كل أعضاء باقة الفرق يمكنهم عرض مجموعات الفريق والإضافة إليها.' },
    body: {
      en: [
        'On a Teams plan, My collections has a second tab for team collections. Anything saved there is visible to everyone in the team.',
        'Team members can add items and files, create collections inside them, and download everything in a collection with its licenses.',
      ],
      ar: [
        'في باقة الفرق، تجد في مجموعاتي تبويبًا ثانيًا لمجموعات الفريق. كل ما يُحفظ فيها يظهر لكل أعضاء الفريق.',
        'يمكن للأعضاء إضافة عناصر وملفات، وإنشاء مجموعات بداخلها، وتنزيل كل محتوى المجموعة مع تراخيصه.',
      ],
    },
  },
  {
    id: 'search-tips',
    topic: 'search',
    title: { en: 'Finding the right item faster', ar: 'العثور على العنصر المناسب بسرعة' },
    summary: { en: 'Use filters, advanced search and words in Arabic or English.', ar: 'استخدم الفلاتر والبحث المتقدم والكلمات بالعربية أو الإنجليزية.' },
    body: {
      en: [
        'Search in Arabic, English or Franco-Arabic. Then narrow the results with the filters on the side, such as orientation, color or length.',
        'Advanced search lets you require words, exclude words and limit results to certain creators.',
      ],
      ar: [
        'ابحث بالعربية أو الإنجليزية أو الفرانكو، ثم ضيّق النتائج بالفلاتر الجانبية مثل الاتجاه أو اللون أو المدة.',
        'يتيح لك البحث المتقدم اشتراط كلمات، واستبعاد كلمات، وقصر النتائج على مصممين معينين.',
      ],
    },
  },
  {
    id: 'search-by-image',
    topic: 'search',
    title: { en: 'Searching with an image or a song', ar: 'البحث بصورة أو بأغنية' },
    summary: { en: 'Find items that look or sound like what you have.', ar: 'اعثر على عناصر تشبه ما لديك شكلًا أو صوتًا.' },
    body: {
      en: [
        'Select the camera in the search bar and upload an image to find items with similar colors and layout.',
        'Select the music note to upload a track or paste a link, and find music with a similar tempo and energy.',
      ],
      ar: [
        'اضغط الكاميرا في شريط البحث وارفع صورة للعثور على عناصر بألوان وتكوين مشابهين.',
        'اضغط علامة الموسيقى لرفع مقطع أو لصق رابط، والعثور على موسيقى بسرعة وطاقة مشابهتين.',
      ],
    },
  },
  {
    id: 'ai-credits',
    topic: 'ai',
    title: { en: 'How AI credits work', ar: 'كيف تعمل أرصدة الذكاء الاصطناعي' },
    summary: { en: 'What each tool costs and when credits reset.', ar: 'تكلفة كل أداة ومتى تتجدد الأرصدة.' },
    body: {
      en: [
        'Every plan includes AI credits each month. Each tool shows its cost before you generate, so you always know what you will spend.',
        'Unused credits do not carry over. On a team plan, the team shares one pool of credits.',
      ],
      ar: [
        'كل باقة تتضمن أرصدة للذكاء الاصطناعي كل شهر. كل أداة تعرض تكلفتها قبل الإنشاء، فتعرف دائمًا ما ستستهلكه.',
        'الأرصدة غير المستخدمة لا تنتقل للشهر التالي. في باقة الفرق يتشارك الفريق رصيدًا واحدًا.',
      ],
    },
  },
  {
    id: 'ai-license',
    topic: 'ai',
    title: { en: 'Using what you generate', ar: 'استخدام ما تنشئه' },
    summary: { en: 'Generated content comes with a license.', ar: 'المحتوى الذي تنشئه يأتي بترخيص.' },
    body: {
      en: [
        'Everything you generate in AI Studio comes with a license, like an item from the library. Download the license from the result.',
        'You can download results, save them to a collection, or use them as the starting point for another tool.',
      ],
      ar: [
        'كل ما تنشئه في استوديو الذكاء الاصطناعي يأتي بترخيص مثل عناصر المكتبة. نزّل الترخيص من النتيجة.',
        'يمكنك تنزيل النتائج، أو حفظها في مجموعة، أو استخدامها كبداية لأداة أخرى.',
      ],
    },
  },
];

// Learn guides: short step-by-step walkthroughs, one for each topic.
export const mockLearnGuides: LearnGuide[] = [
  {
    id: 'license-your-first-item',
    topic: 'licensing',
    title: { en: 'License your first item', ar: 'رخّص أول عنصر لك' },
    summary: { en: 'From finding an item to keeping its certificate.', ar: 'من العثور على العنصر حتى حفظ شهادة ترخيصه.' },
    minutes: 3,
    steps: {
      en: ['Find an item and open its page.', 'Select Download and read what the license covers.', 'Choose where you will use it and name the project.', 'Download the item and keep the license certificate with your project files.'],
      ar: ['ابحث عن عنصر وافتح صفحته.', 'اضغط تنزيل واقرأ ما يغطيه الترخيص.', 'اختر مكان الاستخدام واكتب اسم المشروع.', 'نزّل العنصر واحتفظ بشهادة الترخيص مع ملفات مشروعك.'],
    },
  },
  {
    id: 'organize-a-project',
    topic: 'collections',
    title: { en: 'Organize a project with collections', ar: 'نظّم مشروعًا بالمجموعات' },
    summary: { en: 'Keep items and references for one project together.', ar: 'اجمع عناصر مشروع واحد ومراجعه في مكان واحد.' },
    minutes: 4,
    steps: {
      en: ['Create a collection named after your project.', 'Save items to it from any card.', 'Upload your own reference images, video or audio.', 'When you are ready, select Download all to license and download everything.'],
      ar: ['أنشئ مجموعة باسم مشروعك.', 'احفظ فيها العناصر من أي بطاقة.', 'ارفع صورك أو فيديوهاتك أو ملفاتك الصوتية المرجعية.', 'عندما تكون جاهزًا، اختر تنزيل الكل لترخيص كل شيء وتنزيله.'],
    },
  },
  {
    id: 'search-like-a-pro',
    topic: 'search',
    title: { en: 'Search like a pro', ar: 'ابحث باحتراف' },
    summary: { en: 'Combine keywords, filters and advanced search.', ar: 'اجمع بين الكلمات والفلاتر والبحث المتقدم.' },
    minutes: 3,
    steps: {
      en: ['Start with one or two clear words.', 'Pick a category to see the filters that fit it.', 'Use advanced search to exclude words you do not want.', 'Save the items you like to a collection to compare them later.'],
      ar: ['ابدأ بكلمة أو كلمتين واضحتين.', 'اختر قسمًا لتظهر الفلاتر المناسبة له.', 'استخدم البحث المتقدم لاستبعاد الكلمات التي لا تريدها.', 'احفظ العناصر التي تعجبك في مجموعة لمقارنتها لاحقًا.'],
    },
  },
  {
    id: 'first-ai-image',
    topic: 'ai',
    title: { en: 'Make your first AI image', ar: 'اصنع أول صورة بالذكاء الاصطناعي' },
    summary: { en: 'Write a prompt, pick a style and refine the result.', ar: 'اكتب وصفًا، واختر أسلوبًا، وحسّن النتيجة.' },
    minutes: 5,
    steps: {
      en: ['Open AI Studio and choose Text to image.', 'Describe the picture: the subject, the place, the light and the colors.', 'Pick a style and shape, then select Generate.', 'Use Quick edits or Edit image on the result you like best.'],
      ar: ['افتح استوديو الذكاء الاصطناعي واختر نص إلى صورة.', 'صف الصورة: العنصر الأساسي والمكان والإضاءة والألوان.', 'اختر الأسلوب والشكل ثم اضغط إنشاء.', 'استخدم التعديلات السريعة أو تعديل صورة على النتيجة التي تعجبك.'],
    },
  },
];
