import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  CodeBadge,
  DetailList,
  Icon,
  IconNote,
  LoadingState,
  Modal,
  Stack,
  Text,
  TextField,
} from '@/shared/components';
import { useCopy, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, License, User } from '@/shared/types';
import {
  api,
  authApi,
  buildLicenseCertificate,
  downloadTextFile,
  fillText,
  formatDate,
  originalTitle,
  projectNameMaxLength,
  safeAsync,
  toFileName,
  validateProjectName,
  type ProjectNameError,
} from '@/shared/utils';

interface LicenseDialogProps {
  item: Item;
  user: User;
  open: boolean;
  onClose: () => void;
}

// A subscriber names the project, then gets the item and a license certificate for that project.
// The licensing preference decides the project name: asked every time, the last one suggested,
// or (never ask) the default project used straight away. Mounted only while open, so it always starts fresh.
export const LicenseDialog = ({ item, user, open, onClose }: LicenseDialogProps) => {
  const { text, locale } = useLocale();
  const { setAccount } = useSession();
  const { preference, defaultProjectName, lastProjectName } = user.licensing;
  const automaticProject = preference === 'neverAsk' && defaultProjectName ? defaultProjectName : null;
  const [projectName, setProjectName] = useState(
    automaticProject ?? (preference === 'rememberLast' ? (lastProjectName ?? '') : ''),
  );
  const [fieldError, setFieldError] = useState<ProjectNameError | null>(null);
  const [submitting, setSubmitting] = useState(Boolean(automaticProject));
  const [failed, setFailed] = useState(false);
  const [license, setLicense] = useState<License | null>(null);
  const { status: copyStatus, copy } = useCopy();
  const started = useRef(false); // the automatic license is only requested once

  // Issues the license, adds the download to the queue, and starts the (demo) file download.
  const issue = async (name: string) => {
    setSubmitting(true);
    setFailed(false);
    const result = await safeAsync(async () => {
      const issued = await api.createLicense({ item, projectName: name, user });
      setAccount(
        await authApi.addDownload({
          item,
          projectName: issued.projectName,
          licenseCode: issued.code,
        }),
      );
      return issued;
    });
    setSubmitting(false);
    if (!result.ok) {
      setFailed(true);
      return;
    }
    setLicense(result.data);
    downloadTextFile(`${toFileName(originalTitle(item))}.txt`, fillText(text.license.demoFile, { title: originalTitle(item) }));
  };

  // "Never ask": license for the default project as soon as the dialog opens.
  useEffect(() => {
    if (!automaticProject || started.current) return;
    started.current = true;
    void issue(automaticProject);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when the dialog opens
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const error = validateProjectName(projectName);
    setFieldError(error);
    if (error || submitting) return;
    await issue(projectName);
  };

  const fieldErrorText = fieldError && fillText(text.license.errors[fieldError], { max: projectNameMaxLength });

  if (license) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={text.license.successTitle}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                downloadTextFile(
                  `${toFileName(license.itemTitle)}-license.txt`,
                  buildLicenseCertificate(license, text, locale),
                )
              }
            >
              <Icon name="download" size={vars.sizes.icon.sm} />
              {text.license.downloadCertificate}
            </Button>
            <Button onClick={onClose}>{text.common.done}</Button>
          </>
        }
      >
        <Text color={vars.colors.textMuted}>
          {fillText(text.license.successMessage, { project: license.projectName })}
        </Text>
        <Card gap={vars.spacing[3]} padding={vars.spacing[4]}>
          <Text as="h3" variant="label" color={vars.colors.textMuted}>
            {text.license.certificateTitle}
          </Text>
          <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
            <Text as="span" variant="label">
              {text.license.certificate.code}
            </Text>
            <CodeBadge code={license.code} />
            <Button variant="muted" size="sm" onClick={() => copy(license.code)}>
              <Icon name={copyStatus === 'copied' ? 'check' : 'copy'} size={vars.sizes.icon.sm} />
              {copyStatus === 'copied' ? text.license.codeCopied : text.license.copyCode}
            </Button>
          </Stack>
          {copyStatus === 'failed' && (
            <Text variant="bodySm" color={vars.colors.danger}>
              {text.common.copyFailed}
            </Text>
          )}
          <DetailList
            rows={[
              { label: text.license.certificate.item, value: license.itemTitle, autoDirection: true },
              { label: text.license.certificate.project, value: license.projectName, autoDirection: true },
              { label: text.license.certificate.licensee, value: license.licenseeName, autoDirection: true },
              { label: text.license.certificate.issued, value: formatDate(license.issuedAt, locale) },
            ]}
          />
        </Card>
      </Modal>
    );
  }

  if (automaticProject && submitting && !failed) {
    return (
      <Modal open={open} onClose={onClose} title={text.license.title}>
        <LoadingState minHeight={vars.sizes.stateMessage.compactMinHeight} label={text.license.submitting} />
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={text.license.title}>
      <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
        <IconNote icon="license" title={item.title[locale]} text={text.license.type} autoDirection />

        <TextField
          label={text.license.projectLabel}
          value={projectName}
          onChange={(value) => {
            setProjectName(value);
            if (fieldError) setFieldError(validateProjectName(value));
          }}
          placeholder={text.license.projectPlaceholder}
          hint={text.license.projectHint}
          error={fieldErrorText ?? undefined}
          maxLength={projectNameMaxLength + 1}
          disabled={submitting}
          required
          autoFocus
        />

        {failed && (
          <span role="alert">
            <Text as="span" variant="bodySm" color={vars.colors.danger}>
              {text.license.failed}
            </Text>
          </span>
        )}

        <Stack direction="row" wrap justify="flex-end" gap={vars.spacing[3]}>
          <Button variant="outline" onClick={onClose}>
            {text.common.cancel}
          </Button>
          <Button type="submit" disabled={submitting}>
            <Icon name="download" size={vars.sizes.icon.sm} />
            {submitting ? text.license.submitting : text.license.submit}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
