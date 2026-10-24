import type { CSSProperties } from 'react';
import { assets } from '@/shared/assets';
import { withDefaults } from '@/shared/utils';
import { brandLogoDefaults } from './BrandLogo.defaults';
import type { BrandLogoProps } from './BrandLogo.types';
import styles from './BrandLogo.module.css';

// A third-party logo in its original colors (Google, Apple, Facebook). Logos never mirror in Arabic.
export const BrandLogo = (props: BrandLogoProps) => {
  const { name, size, label } = withDefaults(brandLogoDefaults, props);
  const logo = assets.logos[name];

  return (
    <svg
      viewBox={logo.viewBox}
      className={styles.logo}
      style={{ '--brand-logo-size': size } as CSSProperties}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {logo.shapes.map((shape) => (
        <path key={shape.d} d={shape.d} fill={shape.fill ?? 'currentColor'} />
      ))}
    </svg>
  );
};
