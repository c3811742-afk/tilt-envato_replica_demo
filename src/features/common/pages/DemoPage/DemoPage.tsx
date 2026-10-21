import { Container, ErrorState } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

export const DemoPage = () => {
  const { text } = useLocale();
  return (
    <Container as="main">
      <ErrorState title={text.notFound.title} message={text.notFound.message} showHomeLink />
    </Container>
  );
};
