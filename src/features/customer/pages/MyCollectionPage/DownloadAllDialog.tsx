import { useState, type FormEvent } from 'react';
import { Button, FieldMessage, IconNote, Modal, Select, Stack, Text, TextField } from '@/shared/components';
import { licenseUses, type LicenseUse } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { UserCollection } from '@/shared/types';
import {
  buildLicensesFile,
  downloadTextFile,
  fillText,
  formatNumber,
  libraryApi,
  originalTitle,
  projectNameMaxLength,
  safeAsync,
  toFileName,
  validateProjectName,
} from '@/shared/utils';

// "Download all items and licenses in a collection": every item is licensed for one project,
// then the items and all their licenses download in one file.
export const DownloadAllDialog = ({ collection, onClose }: { collection: UserCollection; onClose: () => void }) => {
  const { text, locale } = useLocale();
  const { session, setAccount } = useSession();
  const { requestError } = useMessages();
  const [projectName, setProjectName] = useState(session.status === 'signedIn' ? (session.user.licensing.lastProjectName ?? '') : '');
  const [use, setUse] = useState<LicenseUse>(licenseUses[0]);
  const [nameError, setNameError] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateProjectName(projectName);
    setNameError(invalid ? fillText(text.license.errors[invalid], { max: projectNameMaxLength }) : undefined);
    if (invalid) return;
    setBusy(true);
    const result = await safeAsync(() => libraryApi.licenseCollection({ collectionId: collection.id, projectName, use }));
    setBusy(false);
    if (!result.ok) {
      setError(requestError(result.error, text.license.failed));
      return;
    }
    setAccount(result.data.account);
    const files = result.data.items.map((item) => fillText(text.license.demoFile, { title: originalTitle(item) }));
    downloadTextFile(`${toFileName(collection.name)}.txt`, [...files, '', buildLicensesFile(result.data.licenses, text, locale)].join('\n'));
    setDone(result.data.licenses.length);
  };

  if (done !== null) {
    return (
      <Modal open onClose={onClose} title={text.myCollections.downloadAllTitle} actions={<Button onClick={onClose}>{text.common.done}</Button>}>
        <IconNote icon="check" text={fillText(text.myCollections.downloadAllDone, { count: formatNumber(done, locale) })} />
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={text.myCollections.downloadAllTitle}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <Text color={vars.colors.textMuted}>{text.myCollections.downloadAllText}</Text>
        <Select
          label={text.license.useLabel}
          value={use}
          onChange={(value) => setUse(value as LicenseUse)}
          options={licenseUses.map((option) => ({ value: option, label: text.license.uses[option] }))}
        />
        <TextField
          label={text.license.projectLabel}
          placeholder={text.license.projectPlaceholder}
          hint={text.license.projectHint}
          value={projectName}
          onChange={setProjectName}
          error={nameError}
          maxLength={projectNameMaxLength + 1}
        />
        <FieldMessage tone="error" message={error} />
        <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
          <Button variant="outline" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? text.license.submitting : text.myCollections.downloadAll}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
