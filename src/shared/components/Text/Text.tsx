import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { textDefaults, textStyleVars } from './Text.defaults';
import type { TextProps } from './Text.types';
import styles from './Text.module.css';

export const Text = (props: TextProps) => {
  const { children, as: Element, variant, color, align, autoDirection, maxLines, id, htmlFor } = withDefaults(
    textDefaults,
    props,
  );
  const textStyle = textStyleVars[variant];

  const style = {
    '--text-font-family': textStyle.fontFamily,
    '--text-font-size': textStyle.fontSize,
    '--text-font-weight': textStyle.fontWeight,
    '--text-line-height': textStyle.lineHeight,
    '--text-letter-spacing': textStyle.letterSpacing,
    '--text-transform': textStyle.textTransform,
    '--text-color': color,
    '--text-align': align,
    '--text-max-lines': maxLines,
  } as CSSProperties;

  return (
    <Element
      id={id}
      htmlFor={Element === 'label' ? htmlFor : undefined}
      className={cx(styles.text, maxLines !== undefined && styles.clamp)}
      style={style}
      dir={autoDirection ? 'auto' : undefined}
    >
      {children}
    </Element>
  );
};
