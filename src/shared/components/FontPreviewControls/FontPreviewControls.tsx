import { fontPreviewSize, textAlignments, type TextAlignment } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber, withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { Slider } from '../Slider';
import { TextField } from '../TextField';
import { fontPreviewControlsDefaults } from './FontPreviewControls.defaults';
import type { FontPreviewControlsProps } from './FontPreviewControls.types';
import styles from './FontPreviewControls.module.css';

const alignIcons = { start: 'alignStart', center: 'alignCenter', end: 'alignEnd' } as const;

// Lets the user try fonts with their own text, at their own size and alignment.
export const FontPreviewControls = (props: FontPreviewControlsProps) => {
  const { value, onChange } = withDefaults(fontPreviewControlsDefaults, props);
  const { text, locale } = useLocale();
  const set = (changes: Partial<typeof value>) => onChange?.({ ...value, ...changes });

  return (
    <div className={styles.controls}>
      <div className={styles.text}>
        <TextField label={text.fontPreview.label} value={value.text} onChange={(typed) => set({ text: typed })} placeholder={text.fontPreview.sample[locale]} />
      </div>
      <div className={styles.size}>
        <Slider
          label={text.fontPreview.size}
          showLabel
          value={value.size}
          min={fontPreviewSize.min}
          max={fontPreviewSize.max}
          step={fontPreviewSize.step}
          valueText={formatNumber(value.size, locale)}
          onChange={(size) => set({ size })}
        />
      </div>
      <div role="radiogroup" aria-label={text.fontPreview.align} className={styles.align}>
        {textAlignments.map((alignment: TextAlignment) => (
          <button
            key={alignment}
            type="button"
            role="radio"
            aria-checked={value.align === alignment}
            aria-label={text.fontPreview.alignOptions[alignment]}
            title={text.fontPreview.alignOptions[alignment]}
            className={styles.alignButton}
            onClick={() => set({ align: alignment })}
          >
            <Icon name={alignIcons[alignment]} size={vars.sizes.icon.sm} flip={false} />
          </button>
        ))}
      </div>
    </div>
  );
};
