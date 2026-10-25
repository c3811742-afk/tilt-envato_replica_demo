import type { DependencyList } from 'react';
import { AsyncContent, ErrorBoundary, ErrorState, ItemRow, Section, stateMessageHeights } from '@/shared/components';
import { useAsync } from '@/shared/hooks';
import type { Item } from '@/shared/types';

interface ItemRowSectionProps {
  title: string;
  subtitle?: string;
  load: () => Promise<Item[]>;
  deps?: DependencyList; // reload when these change (like useEffect)
  actionLabel?: string;
  actionTo?: string;
  hideWhenEmpty?: boolean; // related items: show nothing rather than "Nothing here yet"
}

// A titled row of item cards that loads its own items. It can fail on its own without taking down the page.
export const ItemRowSection = ({ title, subtitle, load, deps = [], actionLabel, actionTo, hideWhenEmpty = false }: ItemRowSectionProps) => {
  const items = useAsync(load, deps);
  if (hideWhenEmpty && items.status === 'empty') return null;
  return (
    <ErrorBoundary fallback={(reset) => <ErrorState onRetry={reset} minHeight={stateMessageHeights.compact} />}>
      <Section title={title} subtitle={subtitle} actionLabel={actionLabel} actionTo={actionTo}>
        <AsyncContent state={items} minHeight={stateMessageHeights.compact}>
          {(data) => <ItemRow items={data} label={title} />}
        </AsyncContent>
      </Section>
    </ErrorBoundary>
  );
};
