import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { Badge } from '../Badge';
import { tierBadgeDefaults } from './TierBadge.defaults';
import type { TierBadgeProps } from './TierBadge.types';

// "Free" or "Premium" on an item, in the active language. Styled by the matching Badge variant.
export const TierBadge = (props: TierBadgeProps) => {
  const { tier } = withDefaults(tierBadgeDefaults, props);
  const { text } = useLocale();
  return <Badge variant={tier}>{text.common[tier]}</Badge>;
};
