import { Container, Text, TextLink } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { currentBanner } from '@/shared/utils';
import styles from './SiteBanner.module.css';

// The team's banner for today (set in the admin's homepage settings), above the header on every page.
export const SiteBanner = () => {
  const { locale } = useLocale();
  const banner = currentBanner();
  if (!banner) return null;

  return (
    <aside className={styles.banner}>
      <Container>
        <Text variant="bodySm" align="center">
          <TextLink href={banner.link} variant="bodySm" color={vars.colors.onPrimary} autoDirection>
            {banner.text[locale]}
          </TextLink>
        </Text>
      </Container>
    </aside>
  );
};
