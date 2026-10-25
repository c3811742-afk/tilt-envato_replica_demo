import { useState } from 'react';
import { fetchFreeElements, fetchSiteElements, saveFreeElements } from '@/features/admin/api';
import { ItemPicker } from '@/features/admin/components';
import { maxFreeElements } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { CatalogElement } from '@/features/admin/types';
import { fromDateKey, toggleItem, toMonthKey } from '@/features/admin/utils';
import { AsyncContent, Button, Notice, Stack, Text, TextField } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatNumber, isolate } from '@/shared/utils';

const monthFormat: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

interface FreeElementsFormProps {
  month: string;
  elements: CatalogElement[];
  initialIds: string[];
}

// The month's saved choice is ticked when the form opens; nothing changes until "Save changes".
const FreeElementsForm = ({ month, elements, initialIds }: FreeElementsFormProps) => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  // An element chosen earlier may have been unpublished since; it can't stay free.
  const [selected, setSelected] = useState(() =>
    initialIds.filter((id) => elements.some((element) => element.id === id)),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.homepage.freeElements;
  const monthName = formatDate(fromDateKey(month), locale, monthFormat);

  // Chosen elements first, so they're easy to review.
  const items = [...elements]
    .sort((a, b) => Number(initialIds.includes(b.id)) - Number(initialIds.includes(a.id)))
    .map((element) => ({
      id: element.id,
      title: element.title,
      description: fillText(t.itemDescription, {
        type: text.admin.elementTypes[element.type],
        name: isolate(element.creator.name),
      }),
    }));

  const save = async () => {
    setNotice(null);
    const result = await run(() => saveFreeElements(currentAdmin.id, month, selected));
    if (result.ok) setNotice(fillText(t.saved, { month: monthName }));
  };

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
      <ItemPicker
        label={fillText(t.pickerLabel, { month: monthName })}
        hint={fillText(t.chosenCount, {
          count: formatNumber(selected.length, locale),
          max: formatNumber(maxFreeElements, locale),
        })}
        items={items}
        selectedIds={selected}
        onToggle={(id) => setSelected((current) => toggleItem(current, id))}
        max={maxFreeElements}
      />
      <Stack direction="row" wrap>
        <Button disabled={pending} onClick={save}>
          {text.common.saveChanges}
        </Button>
      </Stack>
    </Stack>
  );
};

// Free elements of the month: every customer can download them without a plan.
export const FreeElementsTab = () => {
  const { text } = useLocale();
  const [month, setMonth] = useState(toMonthKey());
  const data = useAsync(async () => {
    const [elements, chosen] = await Promise.all([fetchSiteElements(), fetchFreeElements(month)]);
    return { elements, chosen };
  }, [month]);
  const t = text.admin.homepage.freeElements;

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      <TextField type="month" label={t.monthLabel} value={month} onChange={(value) => value && setMonth(value)} />
      <AsyncContent state={data}>
        {/* key: start from the saved choice again when the month changes */}
        {({ elements, chosen }) => (
          <FreeElementsForm key={month} month={month} elements={elements} initialIds={chosen} />
        )}
      </AsyncContent>
    </Stack>
  );
};
