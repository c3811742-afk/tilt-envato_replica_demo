import type { IconName } from '@/shared/assets';
import { Chip, Stack } from '@/shared/components';
import { vars } from '@/shared/theme';

export interface ChipLink {
  key: string;
  label: string;
  to: string;
  icon?: IconName;
}

// A wrapping row of chips that each open a page (categories, occasions, top searches).
export const ChipLinks = ({ links, label }: { links: ChipLink[]; label?: string }) => (
  <Stack as="ul" direction="row" wrap gap={vars.spacing[2]} ariaLabel={label}>
    {links.map((link) => (
      <li key={link.key}>
        <Chip icon={link.icon} to={link.to}>
          <span dir="auto">{link.label}</span>
        </Chip>
      </li>
    ))}
  </Stack>
);
