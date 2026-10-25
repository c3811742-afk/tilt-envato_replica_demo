import { api, categorySettingsStore } from '@/shared/utils';
import { useAsync } from './useAsync';
import { useStoredValue } from './useStoredValue';

// Every category with its item count. Render the result with <AsyncContent>.
// Loads again when the team reorders or hides categories in the admin (in this tab or another one).
export const useCategories = () => {
  const [settings] = useStoredValue(categorySettingsStore);
  return useAsync(api.getCategories, [settings]);
};
