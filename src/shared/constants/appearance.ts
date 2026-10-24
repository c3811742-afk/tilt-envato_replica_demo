import type { ColorMode } from '@/shared/theme';

// What the user picks for light / dark: a fixed mode, or "system" to follow the device setting.
export const modePreferences = ['light', 'dark', 'system'] as const satisfies readonly (ColorMode | 'system')[];
export type ModePreference = (typeof modePreferences)[number];
export const defaultModePreference: ModePreference = 'system';

// The media query that tells whether the device is set to dark mode.
export const darkModeQuery = '(prefers-color-scheme: dark)';
