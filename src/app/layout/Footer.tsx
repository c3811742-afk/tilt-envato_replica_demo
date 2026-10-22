import type { ReactNode } from 'react';
import { ContactButton, Container, Stack, Text, TextLink } from '@/shared/components';
import { navItems, navMenus, type NavKey } from '@/shared/constants';
import { useCookieConsent, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText } from '@/shared/utils';
import styles from './Footer.module.css';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const { text } = useLocale();
  const { openSettings } = useCookieConsent();

  // A column's links; `extra` adds items that aren't pages (e.g. "Cookie settings").
  const linkList = (keys: readonly NavKey[], extra?: ReactNode) => (
    <Stack as="ul" gap={vars.spacing[2]}>
      {keys.map((key) => (
        <li key={key}>
          <TextLink to={navItems[key].to} color={vars.colors.textInverse} underline={false}>
            {text.nav[key]}
          </TextLink>
        </li>
      ))}
      {extra}
    </Stack>
  );

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.columns}>
          <Stack gap={vars.spacing[3]} align="flex-start">
            <Text variant="h2" color={vars.colors.highlight}>
              {text.brand.name}
            </Text>
            <Text color={vars.colors.textInverse}>{text.footer.tagline}</Text>
          </Stack>

          <Stack gap={vars.spacing[3]} align="flex-start">
            <Text as="h2" variant="label" color={vars.colors.textInverse}>
              {text.footer.explore}
            </Text>
            {linkList(navMenus.footerExplore)}
          </Stack>

          <Stack gap={vars.spacing[3]} align="flex-start">
            <Text as="h2" variant="label" color={vars.colors.textInverse}>
              {text.footer.support}
            </Text>
            {linkList(
              navMenus.footerSupport,
              <li>
                <TextLink onClick={openSettings} color={vars.colors.textInverse} underline={false}>
                  {text.cookies.footerLink}
                </TextLink>
              </li>,
            )}
            <ContactButton variant="highlight" size="sm" />
          </Stack>
        </div>

        <div className={styles.bottom}>
          <Text variant="bodySm" color={vars.colors.textInverse}>
            {fillText(text.footer.copyright, { year: currentYear })}
          </Text>
        </div>
      </Container>
    </footer>
  );
};
