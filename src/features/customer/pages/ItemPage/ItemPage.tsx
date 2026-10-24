import { useParams } from 'react-router';
import { AsyncContent, Button, Container, EmptyState } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { api } from '@/shared/utils';
import { ItemDetails } from './ItemDetails';

export const ItemPage = () => {
  const { id = '' } = useParams();
  const { text } = useLocale();
  const item = useAsync(() => api.getItem(id), [id]);

  return (
    <Container>
      <AsyncContent
        state={item}
        empty={
          <EmptyState
            title={text.item.notFoundTitle}
            message={text.item.notFoundMessage}
            action={<Button to={routes.search}>{text.home.cta}</Button>}
          />
        }
      >
        {(data) => data && <ItemDetails key={data.id} item={data} />}
      </AsyncContent>
    </Container>
  );
};
