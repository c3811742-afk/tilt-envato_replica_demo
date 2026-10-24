import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { darkModeQuery, defaultModePreference, modePreferences, storageKeys, type ModePreference } from '@/shared/constants';
import { AppearanceContext } from '@/shared/hooks';
import { accentThemes, defaultAccentTheme, type AccentTheme } from '@/shared/theme';
import { storage } from '@/shared/utils';

const isModePreference = (value: unknown): value is ModePreference =>
  typeof value === 'string' && (modePreferences as readonly string[]).includes(value);
const isAccentTheme = (value: unknown): value is AccentTheme => typeof value === 'string' && value in accentThemes;

const savedModePreference = (): ModePreference => {
  const saved = storage.get(storageKeys.modePreference);
  return isModePreference(saved) ? saved : defaultModePreference;
};
const savedAccent = (): AccentTheme => {
  const saved = storage.get(storageKeys.accentTheme);
  return isAccentTheme(saved) ? saved : defaultAccentTheme;
};

// Follows the device's dark mode setting, and updates when it changes.
const subscribeToDeviceMode = (onChange: () => void) => {
  const query = window.matchMedia(darkModeQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const deviceIsDark = () => window.matchMedia(darkModeQuery).matches;

// Holds the look the user chose (light / dark / match the device, and the accent color) and remembers it.
export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [modePreference, setModePreferenceState] = useState(savedModePreference);
  const [accent, setAccentState] = useState(savedAccent);
  const prefersDark = useSyncExternalStore(subscribeToDeviceMode, deviceIsDark);

  const value = useMemo(() => {
    const mode = modePreference === 'system' ? (prefersDark ? 'dark' : 'light') : modePreference;
    return {
      modePreference,
      mode,
      accent,
      setModePreference: (preference: ModePreference) => {
        setModePreferenceState(preference);
        storage.set(storageKeys.modePreference, preference);
      },
      setAccent: (next: AccentTheme) => {
        setAccentState(next);
        storage.set(storageKeys.accentTheme, next);
      },
    } as const;
  }, [modePreference, accent, prefersDark]);

  return <AppearanceContext value={value}>{children}</AppearanceContext>;
};
