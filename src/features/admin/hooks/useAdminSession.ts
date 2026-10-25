import { createContext, useContext } from 'react';
import type { Permission } from '@/features/admin/constants';
import type { Admin } from '@/features/admin/types';

export interface AdminSessionValue {
  admins: Admin[];
  currentAdmin: Admin;
  switchAdmin: (adminId: string) => void; // demo only, until the team's login page exists
  saveAdmin: (admin: Admin) => void; // adds or updates an admin after a create or role change
  can: (permission: Permission) => boolean;
}

export const AdminSessionContext = createContext<AdminSessionValue | null>(null);

// The signed-in admin and what their role allows. Only available inside the admin layout.
export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) throw new Error('useAdminSession must be used inside <AdminLayout>');
  return context;
};
