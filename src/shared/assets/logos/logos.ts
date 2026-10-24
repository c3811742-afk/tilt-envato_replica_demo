// Third-party brand logos, drawn exactly as the brands publish them (their colors are part of the logo,
// so they stay here with the logo instead of in the theme). Shown by the shared BrandLogo component.
// `fill: null` means the logo follows the text color: Apple's logo is black on light and white on dark.

export interface BrandLogoShape {
  d: string;
  fill: string | null;
}

export interface BrandLogoDefinition {
  viewBox: string;
  shapes: BrandLogoShape[];
}

export const logos = {
  // Google "G" (Sign in with Google branding guidelines)
  google: {
    viewBox: '0 0 48 48',
    shapes: [
      {
        d: 'M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z',
        fill: '#FBBC05',
      },
      {
        d: 'M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z',
        fill: '#EA4335',
      },
      {
        d: 'M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z',
        fill: '#34A853',
      },
      {
        d: 'M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z',
        fill: '#4285F4',
      },
    ],
  },
  // Apple logo (Sign in with Apple guidelines: black or white)
  apple: {
    viewBox: '0 0 24 24',
    shapes: [
      {
        d: 'M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701',
        fill: null,
      },
    ],
  },
  // Facebook "f" logo
  facebook: {
    viewBox: '0 0 24 24',
    shapes: [
      {
        d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
        fill: '#1877F2',
      },
      {
        d: 'M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.09 12.09 0 0 0 3.75 0v-8.385h2.796z',
        fill: '#FFFFFF',
      },
    ],
  },
} as const satisfies Record<string, BrandLogoDefinition>;

export type BrandLogoName = keyof typeof logos;
