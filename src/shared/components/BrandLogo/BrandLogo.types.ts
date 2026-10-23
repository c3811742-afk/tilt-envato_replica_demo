import type { BrandLogoName } from '@/shared/assets';

export interface BrandLogoProps {
  name?: BrandLogoName;
  size?: string;
  label?: string; // accessible name; without it the logo is decorative (e.g. next to "Continue with Google")
}
