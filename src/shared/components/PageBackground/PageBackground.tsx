import { useId, type CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { pageBackgroundDefaults } from './PageBackground.defaults';
import type { PageBackgroundProps } from './PageBackground.types';
import styles from './PageBackground.module.css';

// Drawing coordinates (SVG user units, not CSS sizes): the lines sweep in from the bottom end corner.
const width = 1440;
const height = 900;
const linePath = (index: number) => {
  const startX = -200 + index * 22;
  return `M${startX} ${height + 40} C ${500 + index * 14} ${780 - index * 9}, ${900 + index * 6} ${560 - index * 8}, ${width + 60} ${180 + index * 12}`;
};

// The site background: a ribbon of hairlines from the bottom end corner, fading out before the content.
// Decorative only. It mirrors in Arabic, so the ribbon always starts at the end side.
export const PageBackground = (props: PageBackgroundProps) => {
  const { color, highlightColor, opacity, highlightOpacity, lineCount, highlightEvery, strokeWidth } = withDefaults(pageBackgroundDefaults, props);
  const id = useId();
  const lineFade = `${id}-line`;
  const highlightFade = `${id}-highlight`;

  const style = {
    '--page-background-color': color,
    '--page-background-highlight-color': highlightColor,
    '--page-background-opacity': opacity,
    '--page-background-highlight-opacity': highlightOpacity,
    '--page-background-stroke-width': strokeWidth,
  } as CSSProperties;

  return (
    <svg className={styles.background} style={style} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">
      <defs>
        {/* Strongest at the bottom end corner, gone before the top start of the page. */}
        <linearGradient id={lineFade} gradientUnits="userSpaceOnUse" x1={width} y1={height} x2={width * 0.35} y2={height * 0.2}>
          <stop offset="0" className={styles.lineStart} />
          <stop offset="1" className={styles.lineEnd} />
        </linearGradient>
        <linearGradient id={highlightFade} href={`#${lineFade}`}>
          <stop offset="0" className={styles.highlightStart} />
          <stop offset="1" className={styles.highlightEnd} />
        </linearGradient>
      </defs>
      {Array.from({ length: lineCount }, (_, index) => (
        <path
          key={index}
          className={styles.line}
          d={linePath(index)}
          stroke={`url(#${index % highlightEvery === Math.floor(highlightEvery / 2) ? highlightFade : lineFade})`}
        />
      ))}
    </svg>
  );
};
