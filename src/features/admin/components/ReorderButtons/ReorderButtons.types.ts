import type { MoveDirection } from '@/features/admin/types';

export interface ReorderButtonsProps {
  label: string; // names the item for screen readers, e.g. "Move Ramadan"
  onMove?: (direction: MoveDirection) => void;
  canMoveUp?: boolean; // false for the first item
  canMoveDown?: boolean; // false for the last item
  disabled?: boolean; // while a move is being saved
}
