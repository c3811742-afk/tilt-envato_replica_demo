import { useParams } from 'react-router';
import { AsyncContent, Button, Container, EmptyState } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { api } from '@/shared/utils';
import { CreatorProfileView } from './CreatorProfileView';

export const CreatorPage = () => {
  const { id = '' } = useParams();
  const { text } = useLocale();
  const profile = useAsync(() => api.getCreator(id), [id]);

  return (
    <Container>
      <AsyncContent
        state={profile}
        empty={
          <EmptyState
            title={text.creatorPage.notFoundTitle}
            message={text.creatorPage.notFoundMessage}
            action={<Button to={routes.search}>{text.home.cta}</Button>}
          />
        }
      >
        {(data) => data && <CreatorProfileView key={data.creator.id} profile={data} />}
      </AsyncContent>
    </Container>
  );
};
