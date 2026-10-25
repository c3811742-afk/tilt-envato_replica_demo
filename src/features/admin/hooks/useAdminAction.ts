import { errorMessage } from '@/features/admin/utils';
import { useAction, useLocale } from '@/shared/hooks';

// The shared useAction, with the admin's own error messages (permissions, already decided…).
export const useAdminAction = () => {
  const { text } = useLocale();
  return useAction((error) => errorMessage(error, text));
};
