import { useState, type FormEvent } from 'react';
import { fetchLicenses, findLicense, revokeLicense } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  DetailList,
  Notice,
  Panel,
  ReasonModal,
  Stack,
  TextField,
  type DataTableColumn,
  type DetailItem,
} from '@/features/admin/components';
import { licenseStatusTone, revokeReasons } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { License, RevokeInput } from '@/features/admin/types';
import { fillText, isBlank, isolate, replaceById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';

interface LicenseCardProps {
  license: License;
  onRevoke: (license: License) => void;
}

// Everything on the license certificate, plus why it was revoked if it was.
const LicenseCard = ({ license, onRevoke }: LicenseCardProps) => {
  const { text, locale } = useLocale();
  const t = text.admin.licenses;

  const items: DetailItem[] = [
    { label: t.codeLabel, value: <bdi>{license.code}</bdi> },
    { label: text.admin.columns.status, value: <Badge tone={licenseStatusTone[license.status]}>{t.statuses[license.status]}</Badge> },
    { label: text.admin.columns.element, value: <Text as="span" autoDirection>{license.element.title}</Text> },
    {
      label: text.admin.columns.customer,
      value: (
        <>
          <Text as="span" autoDirection>
            {license.customer.name}
          </Text>{' '}
          <bdi>({license.customer.email})</bdi>
        </>
      ),
    },
    { label: t.projectLabel, value: <Text as="span" autoDirection>{license.project}</Text> },
    { label: text.admin.columns.issued, value: formatDate(license.issuedAt, locale) },
  ];
  if (license.revoke) {
    items.push({
      label: t.revokedLabel,
      value: fillText(t.revokedLine, {
        reason: text.admin.revokeReasons[license.revoke.reason],
        date: formatDate(license.revoke.at, locale),
      }),
    });
  }

  return (
    <Panel title={license.status === 'valid' ? t.validTitle : t.revokedTitle}>
      <DetailList items={items} />
      {license.status === 'valid' && (
        <Stack direction="row">
          <Button variant="danger" onClick={() => onRevoke(license)}>
            {t.revoke}
          </Button>
        </Stack>
      )}
    </Panel>
  );
};

// Find a license by its code to check it's real, see who it belongs to, and revoke it if it was bought by fraud.
export const LookupTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const licenses = useAsync(fetchLicenses, []);
  const lookup = useAdminAction();
  const revoke = useAdminAction();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [result, setResult] = useState<License | 'none' | null>(null);
  const [revoking, setRevoking] = useState<License | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.licenses;

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (isBlank(code)) {
      setCodeError(t.codeRequired);
      return;
    }
    setCodeError(undefined);
    const found = await lookup.run(() => findLicense(code));
    if (found.ok) setResult(found.data ?? 'none');
  };

  const submitRevoke = async (input: RevokeInput) => {
    if (!revoking) return;
    const saved = await revoke.run(() => revokeLicense(currentAdmin.id, revoking.id, input));
    if (!saved.ok) return;
    setRevoking(null);
    setNotice(fillText(t.revokedNotice, { code: isolate(saved.data.code) }));
    if (result !== 'none' && result?.id === saved.data.id) setResult(saved.data);
    if (licenses.status === 'success') licenses.update(replaceById(licenses.data, saved.data));
  };

  const columns: DataTableColumn<License>[] = [
    {
      key: 'code',
      header: t.codeLabel,
      render: (license) => (
        <Text as="span">
          <bdi>{license.code}</bdi>
        </Text>
      ),
    },
    {
      key: 'element',
      header: text.admin.columns.element,
      render: (license) => (
        <Text as="span" autoDirection>
          {license.element.title}
        </Text>
      ),
    },
    {
      key: 'customer',
      header: text.admin.columns.customer,
      render: (license) => (
        <Text as="span" autoDirection>
          {license.customer.name}
        </Text>
      ),
    },
    { key: 'issued', header: text.admin.columns.issued, render: (license) => formatDate(license.issuedAt, locale) },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (license) => <Badge tone={licenseStatusTone[license.status]}>{t.statuses[license.status]}</Badge>,
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      align: 'end',
      render: (license) => (
        <Button size="sm" variant="muted" onClick={() => setResult(license)}>
          {t.view}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <form noValidate onSubmit={search}>
        <Stack gap={vars.spacing[3]}>
          <TextField
            label={t.codeLabel}
            hint={t.codeHint}
            placeholder={t.codePlaceholder}
            value={code}
            onChange={setCode}
            error={codeError}
            direction="ltr"
            required
          />
          <Stack direction="row">
            <Button type="submit" disabled={lookup.pending}>
              {t.lookUp}
            </Button>
          </Stack>
        </Stack>
      </form>
      {lookup.error && <Notice tone="danger">{lookup.error}</Notice>}
      {result === 'none' && <Notice tone="warning">{t.notFound}</Notice>}
      {result && result !== 'none' && <LicenseCard license={result} onRevoke={setRevoking} />}
      <Panel title={t.recentTitle}>
        <AsyncContent state={licenses} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
          {(list) => <DataTable label={t.recentTitle} columns={columns} rows={list} getRowKey={(row) => row.id} />}
        </AsyncContent>
      </Panel>
      {revoking && (
        <ReasonModal
          title={t.revokeTitle}
          confirmLabel={t.revoke}
          message={t.revokeMessage}
          reasons={revokeReasons}
          reasonLabels={text.admin.revokeReasons}
          noteLabel={t.revokeNoteLabel}
          pending={revoke.pending}
          error={revoke.error}
          onClose={() => setRevoking(null)}
          onSubmit={submitRevoke}
        >
          <Text>
            <bdi>
              <strong>{revoking.code}</strong>
            </bdi>
          </Text>
        </ReasonModal>
      )}
    </Stack>
  );
};
