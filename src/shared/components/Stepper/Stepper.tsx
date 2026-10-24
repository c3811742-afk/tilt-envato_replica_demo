import type { CSSProperties } from 'react';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, formatNumber, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { stepperDefaults } from './Stepper.defaults';
import type { StepperProps } from './Stepper.types';
import styles from './Stepper.module.css';

// Numbered steps of a process (a multi-step form, an order or application status): done, current and upcoming.
// Side by side on wider screens, stacked on phones.
export const Stepper = (props: StepperProps) => {
  const { steps, current, label, activeColor, activeTextColor, upcomingColor } = withDefaults(stepperDefaults, props);
  const { locale } = useLocale();
  const style = {
    '--stepper-count': steps.length,
    '--stepper-active': activeColor,
    '--stepper-active-text': activeTextColor,
    '--stepper-upcoming': upcomingColor,
  } as CSSProperties;

  return (
    <ol className={styles.stepper} style={style} aria-label={label}>
      {steps.map((step, index) => {
        const status = index < current ? 'done' : index === current ? 'current' : 'upcoming';
        return (
          <li key={step.label} className={cx(styles.step, styles[status])} aria-current={status === 'current' ? 'step' : undefined}>
            <span className={styles.bar} aria-hidden="true" />
            <span className={styles.head}>
              <span className={styles.marker} aria-hidden="true">
                {status === 'done' ? <Icon name="check" size={vars.sizes.icon.sm} /> : formatNumber(index + 1, locale)}
              </span>
              <Text as="span" variant="title" color={status === 'upcoming' ? vars.colors.textMuted : vars.colors.text}>
                {step.label}
              </Text>
            </span>
            {step.description && (
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {step.description}
              </Text>
            )}
            {step.meta && (
              <Text variant="caption" color={vars.colors.textMuted}>
                {step.meta}
              </Text>
            )}
          </li>
        );
      })}
    </ol>
  );
};
