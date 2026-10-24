import { useNavigate, useParams } from 'react-router';
import { fetchElement } from '@/features/admin/api';
import { Notice, RequirePermission } from '@/features/admin/components';
import { useFlashNotice } from '@/features/admin/hooks';
import { AsyncContent, Button, EmptyState, Stack, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { ReviewElementView } from './ReviewElementView';

const ReviewElement = () => {
  const { elementId = '' } = useParams();
  const { text } = useLocale();
  const navigate = useNavigate();
  const { notice, dismiss } = useFlashNotice();
  const element = useAsync(() => fetchElement(elementId), [elementId]);
  const t = text.admin;

  return (
    <Stack>
      <TextLink to={routes.adminReview}>{t.review.backToQueue}</TextLink>
      {notice && (
        <Notice tone="success" onDismiss={dismiss}>
          {t.notices[notice]}
        </Notice>
      )}
      <AsyncContent
        state={element}
        empty={
          <EmptyState
            title={t.review.notFoundTitle}
            message={t.review.notFoundMessage}
            action={<Button onClick={() => navigate(routes.adminReview)}>{t.review.backToQueue}</Button>}
          />
        }
      >
        {/* key: reset the checklist and dialogs when moving to the next element */}
        {(data) => data && <ReviewElementView key={data.id} element={data} />}
      </AsyncContent>
    </Stack>
  );
};

export const ReviewElementPage = () => (
  <RequirePermission permission="review">
    <ReviewElement />
  </RequirePermission>
);
