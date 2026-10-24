import { ReasonModal } from '@/features/admin/components';
import { unpublishReasons } from '@/features/admin/constants';
import type { CatalogElement, UnpublishInput } from '@/features/admin/types';
import { Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';

interface UnpublishModalProps {
  element: CatalogElement;
  pending: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: UnpublishInput) => void;
}

// Asks for a reason (required) and an optional note before taking an element off the site.
export const UnpublishModal = ({ element, pending, error, onClose, onSubmit }: UnpublishModalProps) => {
  const { text } = useLocale();
  const t = text.admin.live;

  return (
    <ReasonModal
      title={t.unpublishTitle}
      confirmLabel={t.unpublish}
      message={t.unpublishMessage}
      reasons={unpublishReasons}
      reasonLabels={text.admin.unpublishReasons}
      pending={pending}
      error={error}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Text autoDirection>
        <strong>{element.title}</strong>
      </Text>
    </ReasonModal>
  );
};
