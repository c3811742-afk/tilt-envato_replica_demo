import { useState, type FormEvent } from 'react';
import { adminErrorCode, createAdmin } from '@/features/admin/api';
import { adminRoles } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Admin, AdminRole } from '@/features/admin/types';
import { isValidEmail } from '@/features/admin/utils';
import { Modal, ModalActions, Notice, Select, TextField } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { isOneOf } from '@/shared/utils';

interface AddAdminModalProps {
  onClose: () => void;
  onCreated: (admin: Admin) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

// Super admins add a new admin with a name, email and role. Errors show next to their field.
export const AddAdminModal = ({ onClose, onCreated }: AddAdminModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const t = text.admin.admins;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole | ''>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const { run, busy: pending, error: formError, clearError } = useAdminAction();

  const validate = (): FormErrors => ({
    name: name.trim() ? undefined : t.nameRequired,
    email: !email.trim() ? t.emailRequired : isValidEmail(email) ? undefined : t.emailInvalid,
    role: role ? undefined : t.roleRequired,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    clearError();
    if (found.name || found.email || found.role || !role) return;

    const result = await run(() => createAdmin(currentAdmin.id, { name, email, role }));
    if (result.ok) {
      onCreated(result.data);
      return;
    }
    // A taken email belongs to the email field; anything else is shown above the form.
    if (adminErrorCode(result.error) === 'emailTaken') {
      clearError();
      setErrors({ email: text.admin.errors.emailTaken });
    }
  };

  return (
    <Modal
      open
      title={t.add}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={t.add} onCancel={onClose} submit busy={pending} />
      }
    >
      {formError && <Notice tone="danger">{formError}</Notice>}
      <TextField
        label={t.nameLabel}
        value={name}
        onChange={setName}
        error={errors.name}
        autoComplete="name"
        required
      />
      <TextField
        type="email"
        label={t.emailLabel}
        value={email}
        onChange={setEmail}
        error={errors.email}
        autoComplete="email"
        required
      />
      <Select
        label={t.roleLabel}
        placeholder={t.rolePlaceholder}
        options={adminRoles.map((value) => ({ value, label: text.admin.roles[value] }))}
        value={role}
        onChange={(value) => isOneOf(value, adminRoles) && setRole(value)}
        error={errors.role}
        required
      />
    </Modal>
  );
};
