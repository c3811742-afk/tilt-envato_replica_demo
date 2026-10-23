import { createContext, useContext, type ReactNode } from 'react';
import type { Item } from '@/shared/types';

// Buttons shown on every item card (e.g. favorite and "Save to collection"). The app provides them,
// so shared cards don't depend on features; without a provider, cards show none.
export type ItemActionsRenderer = (item: Item) => ReactNode;

export const ItemActionsContext = createContext<ItemActionsRenderer | null>(null);

export const useItemActions = () => useContext(ItemActionsContext);
