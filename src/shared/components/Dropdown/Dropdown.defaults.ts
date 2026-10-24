import { vars } from '@/shared/theme';
import type { DropdownProps } from './Dropdown.types';

export const dropdownDefaults: Required<Pick<DropdownProps, 'width' | 'triggerHeight'>> = {
  width: vars.sizes.dropdown.width,
  triggerHeight: vars.sizes.button.height.sm, // the header's small buttons
};
