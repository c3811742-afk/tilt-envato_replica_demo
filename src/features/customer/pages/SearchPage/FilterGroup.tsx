import type { ReactNode } from 'react';
import { Stack, Text } from '@/shared/components';
import { vars } from '@/shared/theme';

// One titled group in the search side panel (sort, view, a filter).
export const FilterGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap={vars.spacing[2]}>
    <Text as="h2" variant="title">
      {label}
    </Text>
    {children}
  </Stack>
);
