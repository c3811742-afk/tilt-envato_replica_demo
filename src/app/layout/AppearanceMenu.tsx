import { Dropdown, Icon, SegmentedControl, Stack, SwatchGroup, Text } from '@/shared/components';
import { modePreferences, type ModePreference } from '@/shared/constants';
import { useAppearance, useLocale } from '@/shared/hooks';
import { accentThemes, vars, type AccentTheme } from '@/shared/theme';

const accentOptions = Object.keys(accentThemes) as AccentTheme[];

// "A guest can choose the site's theme": light / dark / follow the device, and the accent color.
export const AppearanceMenu = () => {
  const { text } = useLocale();
  const { modePreference, mode, accent, setModePreference, setAccent } = useAppearance();

  return (
    <Dropdown label={text.appearance.label} trigger={<Icon name={mode === 'dark' ? 'moon' : 'sun'} size={vars.sizes.icon.sm} />}>
      <Stack gap={vars.spacing[4]}>
        <Stack gap={vars.spacing[2]}>
          <Text variant="label" color={vars.colors.textMuted}>
            {text.appearance.mode}
          </Text>
          <SegmentedControl<ModePreference>
            label={text.appearance.mode}
            size="sm"
            fullWidth
            value={modePreference}
            onChange={setModePreference}
            options={modePreferences.map((preference) => ({ value: preference, label: text.appearance.modes[preference] }))}
          />
        </Stack>
        <Stack gap={vars.spacing[2]}>
          <Text variant="label" color={vars.colors.textMuted}>
            {text.appearance.accent}
          </Text>
          <SwatchGroup<AccentTheme>
            label={text.appearance.accent}
            value={accent}
            onChange={setAccent}
            options={accentOptions.map((option) => ({
              value: option,
              label: text.appearance.accents[option],
              color: vars.accentThemes[option].primary,
              onColor: vars.accentThemes[option].onPrimary,
            }))}
          />
        </Stack>
      </Stack>
    </Dropdown>
  );
};
