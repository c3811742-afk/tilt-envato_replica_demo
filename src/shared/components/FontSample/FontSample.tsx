import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { fontSampleDefaults } from './FontSample.defaults';
import type { FontSampleProps } from './FontSample.types';
import styles from './FontSample.module.css';

// Text set in a font item's preview font: what the user typed, or a sample sentence.
export const FontSample = (props: FontSampleProps) => {
  const { family, text, size, align, color, maxLines } = withDefaults(fontSampleDefaults, props);
  const style = {
    // The interface font is the fallback, so letters the preview font lacks still show.
    '--font-sample-family': family ? `'${family}', ${vars.typography.fontFamily.body}` : vars.typography.fontFamily.body,
    '--font-sample-size': size,
    '--font-sample-align': align,
    '--font-sample-color': color,
    '--font-sample-lines': maxLines,
  } as CSSProperties;

  return (
    <p className={styles.sample} style={style} dir="auto">
      {text}
    </p>
  );
};
