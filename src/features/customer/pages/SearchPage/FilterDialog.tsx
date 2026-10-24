import type { ReactNode } from 'react';
import { Button, Modal } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { fillText, formatNumber } from '@/shared/utils';

interface FilterDialogProps {
  open: boolean;
  count: number; // results with the filters picked so far
  onClose: () => void;
  children: ReactNode; // the filter panel
}

// Phones: sort, view and filters open in a dialog. Filters apply as they're picked; the button shows the result count.
export const FilterDialog = ({ open, count, onClose, children }: FilterDialogProps) => {
  const { text, locale } = useLocale();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.filters.dialogTitle}
      actions={<Button onClick={onClose}>{fillText(text.filters.showResults, { count: formatNumber(count, locale) })}</Button>}
    >
      {children}
    </Modal>
  );
};
