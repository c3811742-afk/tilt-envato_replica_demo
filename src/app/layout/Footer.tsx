import type { ReactNode } from 'react';
import { ContactButton, Container, Icon, Stack, Text, TextLink } from '@/shared/components';
import { navItems, navMenus, networkSites, socialLinks, socialPlatforms, type NavKey } from '@/shared/constants';
import { useCookieConsent, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText } from '@/shared/utils';
import { NewsletterForm } from './NewsletterForm';
import styles from './Footer.module.css';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const { text } = useLocale();
  const { openSettings } = useCookieConsent();

  // A column: its title and links; `extra` adds items that aren't pages (e.g. "Cookie settings").
  const column = (title: string, keys: readonly NavKey[], extra?: ReactNode, after?: ReactNode) => (
    <Stack gap={vars.spacing[3]} align="flex-start">
      <Text as="h2" variant="label" color={vars.colors.textInverse}>
        {title}
      </Text>
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
      {after}
    </Stack>
  );

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.columns}>
          <Stack gap={vars.spacing[5]} align="flex-start">
            <Stack gap={vars.spacing[3]} align="flex-start">
              <Text variant="h2" color={vars.colors.highlight}>
                {text.brand.name}
              </Text>
              <Text color={vars.colors.textInverse}>{text.footer.tagline}</Text>
            </Stack>
            <NewsletterForm />
          </Stack>
          {column(text.footer.explore, navMenus.footerExplore)}
          {column(text.footer.resources, navMenus.footerResources)}
          {column(text.footer.company, navMenus.footerCompany)}
          {column(text.footer.support, navMenus.footerSupport, undefined, <ContactButton variant="highlight" size="sm" />)}
          {column(
            text.footer.legal,
            navMenus.footerLegal,
            <li>
              <TextLink onClick={openSettings} color={vars.colors.textInverse} underline={false}>
                {text.cookies.footerLink}
              </TextLink>
            </li>,
          )}
        </div>

        <div className={styles.bottom}>
          <Stack direction="row" wrap align="center" gap={vars.spacing[4]}>
            <Text as="span" variant="label" color={vars.colors.textInverse}>
              {text.footer.network}
            </Text>
            <Stack as="ul" direction="row" wrap gap={vars.spacing[4]}>
              {networkSites.map((site) => (
                <li key={site.key}>
                  <TextLink href={site.url} color={vars.colors.textInverse} underline={false}>
                    {site.name}
                  </TextLink>
                </li>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[4]}>
            <Stack as="ul" direction="row" wrap gap={vars.spacing[3]} ariaLabel={text.footer.followUs}>
              {socialPlatforms.map((platform) => (
                <li key={platform}>
                  <a className={styles.social} href={socialLinks[platform]} target="_blank" rel="noreferrer" aria-label={text.footer.social[platform]}>
                    <Icon name={platform} size={vars.sizes.icon.md} />
                  </a>
                </li>
              ))}
            </Stack>
            <Text variant="bodySm" color={vars.colors.textInverse}>
              {fillText(text.footer.copyright, { year: currentYear })}
            </Text>
          </Stack>
        </div>
      </Container>
    </footer>
  );
};
