import { vars } from '@/shared/theme';
import type { StepperProps } from './Stepper.types';

export const stepperDefaults: Required<Pick<StepperProps, 'steps' | 'current' | 'activeColor' | 'activeTextColor' | 'upcomingColor'>> = {
  steps: [],
  current: 0,
  activeColor: vars.colors.primary,
  activeTextColor: vars.colors.onPrimary,
  upcomingColor: vars.colors.borderMuted,
};
