import { createContext, useContext } from 'react';
import type { ModePreference } from '@/shared/constants';
import type { AccentTheme, ColorMode } from '@/shared/theme';

export interface AppearanceContextValue {
  modePreference: ModePreference; // what the user picked
  mode: ColorMode; // what is shown: "system" resolved to light or dark
  accent: AccentTheme;
  setModePreference: (preference: ModePreference) => void;
  setAccent: (accent: AccentTheme) => void;
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);

// The site's look the user chose: light / dark / match the device, and the accent color.
export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used inside <AppearanceProvider>');
  return context;
};
