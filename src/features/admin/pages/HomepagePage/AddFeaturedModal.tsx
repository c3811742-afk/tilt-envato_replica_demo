import { useState, type FormEvent } from 'react';
import { addFeatured, fetchCollections, fetchLiveElements } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { featuredKinds } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { FeaturedKind, FeaturedSlot } from '@/features/admin/types';
import { isOneOf } from '@/features/admin/utils';
import { AsyncContent, Button, Modal, Select } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';

const loadOptions = async () => {
  const [elements, collections] = await Promise.all([fetchLiveElements(), fetchCollections()]);
  return { elements, collections };
};

interface AddFeaturedModalProps {
  featured: FeaturedSlot[];
  onClose: () => void;
  onAdded: (featured: FeaturedSlot[], title: string) => void;
}

// Picks a live element or a collection to add at the end of the "Featured" row.
export const AddFeaturedModal = ({ featured, onClose, onAdded }: AddFeaturedModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, pending, error } = useAdminAction();
  const options = useAsync(loadOptions, []);
  const t = text.admin.homepage.featured;
  const [kind, setKind] = useState<FeaturedKind>('element');
  const [refId, setRefId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isFeatured = (id: string) => featured.some((slot) => slot.kind === kind && slot.refId === id);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!refId) return;
    const result = await run(() => addFeatured(currentAdmin.id, kind, refId));
    if (result.ok) onAdded(result.data, result.data[result.data.length - 1]?.title ?? '');
  };

  return (
    <Modal
      open
      title={t.addTitle}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="muted" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={pending || options.status !== 'success'}>
            {t.add}
          </Button>
        </>
      }
    >
      {error && <Notice tone="danger">{error}</Notice>}
      <AsyncContent state={options}>
        {({ elements, collections }) => {
          const items = kind === 'element' ? elements : collections;
          return (
            <>
              <Select
                label={t.kindLabel}
                options={featuredKinds.map((value) => ({ value, label: text.admin.featuredKinds[value] }))}
                value={kind}
                onChange={(value) => {
                  if (!isOneOf(featuredKinds, value)) return;
                  setKind(value);
                  setRefId('');
                }}
              />
              <Select
                label={text.admin.featuredKinds[kind]}
                placeholder={t.itemPlaceholder}
                options={items
                  .filter((item) => !isFeatured(item.id))
                  .map((item) => ({ value: item.id, label: item.title }))}
                value={refId}
                onChange={setRefId}
                error={submitted && !refId ? t.itemRequired : undefined}
                required
              />
            </>
          );
        }}
      </AsyncContent>
    </Modal>
  );
};
