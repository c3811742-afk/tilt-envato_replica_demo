import type { TextShape } from '@/shared/types';
import type { en } from './en';

export const ar: TextShape<typeof en> = {
  meta: {
    title: 'TILT | نسخة تجريبية من إنفاتو',
  },
  common: {
    switchLanguage: 'English',
    loading: 'جارٍ التحميل…',
    tryAgain: 'حاول مرة أخرى',
    backToHome: 'العودة إلى الرئيسية',
  },
  states: {
    error: {
      title: 'حدث خطأ ما',
      message: 'تعذّر تحميل هذا المحتوى. يُرجى المحاولة مرة أخرى.',
    },
    empty: {
      title: 'لا يوجد شيء هنا بعد',
      message: 'لا يوجد ما يُعرض حاليًا.',
    },
    crash: {
      title: 'حدث خطأ ما',
      message: 'حدث خطأ غير متوقع. يُرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.',
    },
  },
  notFound: {
    title: 'الصفحة غير موجودة',
    message: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
  },
  home: {
    title: 'كل ما تحتاجه من ملفات إبداعية',
    subtitle: 'قوالب ورسومات وخطوط وموسيقى وفيديو، كلها في اشتراك واحد.',
    cta: 'تصفّح العناصر',
  },
};
