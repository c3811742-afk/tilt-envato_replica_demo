import { useState } from 'react';
import { changeAdminRole } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  Notice,
  PageHeader,
  RequirePermission,
  SelectField,
  Stack,
  type DataTableColumn,
  type NoticeTone,
} from '@/features/admin/components';
import { adminRoles } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { Admin } from '@/features/admin/types';
import { errorMessage, fillText, isOneOf, isolate } from '@/features/admin/utils';
import { Button, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, safeAsync } from '@/shared/utils';
import { AddAdminModal } from './AddAdminModal';

const Admins = () => {
  const { text, locale } = useLocale();
  const { admins, currentAdmin, saveAdmin } = useAdminSession();
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const t = text.admin;

  const roleOptions = adminRoles.map((role) => ({ value: role, label: t.roles[role] }));

  const changeRole = async (admin: Admin, value: string) => {
    if (!isOneOf(adminRoles, value) || value === admin.role) return;
    setSavingId(admin.id);
    setNotice(null);
    const result = await safeAsync(() => changeAdminRole(currentAdmin.id, admin.id, value));
    setSavingId(null);
    if (!result.ok) {
      setNotice({ tone: 'danger', message: errorMessage(result.error, text) });
      return;
    }
    saveAdmin(result.data);
    setNotice({
      tone: 'success',
      message: fillText(t.admins.roleChanged, { name: isolate(result.data.name), role: t.roles[result.data.role] }),
    });
  };

  const handleCreated = (admin: Admin) => {
    saveAdmin(admin);
    setAdding(false);
    setNotice({ tone: 'success', message: fillText(t.admins.created, { name: isolate(admin.name), role: t.roles[admin.role] }) });
  };

  const columns: DataTableColumn<Admin>[] = [
    {
      key: 'name',
      header: t.columns.name,
      render: (admin) => (
        <Stack gap={vars.spacing[1]} align="start">
          <Text as="span" autoDirection>
            {admin.name}
          </Text>
          {admin.id === currentAdmin.id && <Badge tone="primary">{t.admins.you}</Badge>}
        </Stack>
      ),
    },
    {
      key: 'email',
      header: t.columns.email,
      render: (admin) => (
        <Text as="span">
          <bdi>{admin.email}</bdi>
        </Text>
      ),
    },
    {
      key: 'role',
      header: t.columns.role,
      // You can't change your own role, so there is always at least one super admin.
      render: (admin) => (
        <SelectField
          hideLabel
          label={fillText(t.admins.roleFor, { name: isolate(admin.name) })}
          options={roleOptions}
          value={admin.role}
          disabled={admin.id === currentAdmin.id || savingId === admin.id}
          onChange={(value) => changeRole(admin, value)}
        />
      ),
    },
    { key: 'added', header: t.columns.added, render: (admin) => formatDate(admin.createdAt, locale) },
  ];

  const sortedAdmins = [...admins].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader
        title={t.admins.title}
        description={t.admins.description}
        actions={<Button onClick={() => setAdding(true)}>{t.admins.add}</Button>}
      />
      {notice && (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.message}
        </Notice>
      )}
      <DataTable label={t.admins.tableLabel} columns={columns} rows={sortedAdmins} getRowKey={(admin) => admin.id} />
      {adding && <AddAdminModal onClose={() => setAdding(false)} onCreated={handleCreated} />}
    </Stack>
  );
};

// The admin list itself is loaded once by AdminLayout (it also feeds the "Signed in as" switch).
export const AdminsPage = () => (
  <RequirePermission permission="manageAdmins">
    <Admins />
  </RequirePermission>
);
