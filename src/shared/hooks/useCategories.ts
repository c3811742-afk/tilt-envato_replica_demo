import { api } from '@/shared/utils';
import { useAsync } from './useAsync';

// Every category with its item count. Render the result with <AsyncContent>.
export const useCategories = () => useAsync(api.getCategories, []);
