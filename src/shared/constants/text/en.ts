// Source of truth for UI text. Every key added here must be added to ar.ts too (it's a compile error otherwise).
// Wording rules: see "UI wording" in CLAUDE.md.
export const en = {
  meta: {
    title: 'TILT Envato Replica Demo',
  },
  common: {
    switchLanguage: 'العربية',
    loading: 'Loading…',
    tryAgain: 'Try again',
    backToHome: 'Back to home',
  },
  states: {
    error: {
      title: 'Something went wrong',
      message: "We couldn't load this content. Please try again.",
    },
    empty: {
      title: 'Nothing here yet',
      message: "There's nothing to show right now.",
    },
    crash: {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again or go back to the home page.',
    },
  },
  notFound: {
    title: 'Page not found',
    message: "The page you're looking for doesn't exist or has been moved.",
  },
  home: {
    title: 'Every creative asset you need',
    subtitle: 'Templates, graphics, fonts, music and video, all in one subscription.',
    cta: 'Browse elements',
  },
};
