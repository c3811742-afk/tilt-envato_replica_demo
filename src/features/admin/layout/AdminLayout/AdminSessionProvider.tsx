import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Permission } from '@/features/admin/constants';
import { AdminSessionContext } from '@/features/admin/hooks';
import type { Admin } from '@/features/admin/types';
import { hasPermission } from '@/features/admin/utils';
import { storageKeys } from '@/shared/constants';
import { storage } from '@/shared/utils';

// The last admin picked in the switch, or the first super admin.
const initialAdminId = (admins: Admin[]) => {
  const saved = storage.get(storageKeys.adminSession);
  const savedAdmin = admins.find((admin) => admin.id === saved);
  return (savedAdmin ?? admins.find((admin) => admin.role === 'superAdmin') ?? admins[0]).id;
};

interface AdminSessionProviderProps {
  initialAdmins: Admin[]; // never empty: the layout shows an empty state instead
  children: ReactNode;
}

// Demo session: holds the admin list and which admin is "signed in".
// When the team's login page is ready, the current admin comes from there instead of the switch.
export const AdminSessionProvider = ({ initialAdmins, children }: AdminSessionProviderProps) => {
  const [admins, setAdmins] = useState(initialAdmins);
  const [currentId, setCurrentId] = useState(() => initialAdminId(initialAdmins));
  const currentAdmin = admins.find((admin) => admin.id === currentId) ?? admins[0];

  const switchAdmin = useCallback((adminId: string) => {
    setCurrentId(adminId);
    storage.set(storageKeys.adminSession, adminId);
  }, []);

  const saveAdmin = useCallback(
    (saved: Admin) =>
      setAdmins((list) =>
        list.some((admin) => admin.id === saved.id)
          ? list.map((admin) => (admin.id === saved.id ? saved : admin))
          : [...list, saved],
      ),
    [],
  );

  const value = useMemo(
    () => ({
      admins,
      currentAdmin,
      switchAdmin,
      saveAdmin,
      can: (permission: Permission) => hasPermission(currentAdmin.role, permission),
    }),
    [admins, currentAdmin, switchAdmin, saveAdmin],
  );

  return <AdminSessionContext value={value}>{children}</AdminSessionContext>;
};
