import { useLocale } from '@/shared/hooks';
import { locales, type Locale } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Field } from '../Field';

import { localizedFieldDefaults } from './LocalizedField.defaults';
import type { LocalizedFieldProps } from './LocalizedField.types';
import styles from './LocalizedField.module.css';
import { TextField } from '@/shared/components';

const languages: Locale[] = ['en', 'ar'];

// One field written in both site languages: an English box and an Arabic box, each in its own direction.
export const LocalizedField = (props: LocalizedFieldProps) => {
  const { label, value, onChange, multiline, hint, errors, required } = withDefaults(localizedFieldDefaults, props);
  const { text } = useLocale();

  return (
    <Field group label={label} hint={hint}>
      <div className={styles.languages}>
        {languages.map((language) => (
          <TextField
            key={language}
            label={text.admin.languageNames[language]}
            value={value[language]}
            onChange={(next) => onChange?.({ ...value, [language]: next })}
            rows={multiline ? 4 : 1}
            error={errors[language]}
            required={required}
            lang={locales[language].lang}
            direction={locales[language].dir}
          />
        ))}
      </div>
    </Field>
  );
};
