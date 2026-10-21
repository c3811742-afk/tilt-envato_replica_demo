import { Button, Container, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const { text, switchLocale } = useLocale();

  return (
    <Container as="main">
      <section className={styles.hero}>
        <Text as="h1" variant="display">
          {text.home.title}
        </Text>
        <Text color={vars.colors.textMuted}>{text.home.subtitle}</Text>
        <div className={styles.actions}>
          <Button>{text.home.cta}</Button>
          <Button variant="secondary" onClick={switchLocale}>
            {text.common.switchLanguage}
          </Button>
        </div>
      </section>
    </Container>
  );
};
