import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Card, CodeBadge, DetailList, FieldMessage, Icon, IconNote, LoadingState, Modal, ModalActions, Select, Stack, Text, TextField, TextLink } from '@/shared/components';
import { accountPath, licenseUses, routes, type LicenseUse } from '@/shared/constants';
import { useAction, useCopy, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, License, Session } from '@/shared/types';
import {
  accountAllowance,
  buildLicenseCertificate,
  buildProofLetter,
  downloadTextFile,
  fillText,
  formatDate,
  formatFileSize,
  formatNumber,
  libraryApi,
  originalTitle,
  projectNameMaxLength,
  toFileName,
  validateProjectName,
  type ProjectNameError,
} from '@/shared/utils';

interface LicenseDialogProps {
  item: Item;
  session: Extract<Session, { status: 'signedIn' }>;
  open: boolean;
  onClose: () => void;
}

const isMusic = (item: Item) => item.categoryId === 'music';

// A subscriber (or pass holder) sees the file size, what the license covers and how many downloads are left,
// says where the item will be used and names the project, then gets the item and a license certificate.
// The licensing preference decides the project name: asked every time, the last one suggested,
// or (never ask) the default project used straight away. Mounted only while open, so it always starts fresh.
export const LicenseDialog = ({ item, session, open, onClose }: LicenseDialogProps) => {
  const { text, locale } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const { user } = session;
  const { preference, defaultProjectName, lastProjectName } = user.licensing;
  const automaticProject = preference === 'neverAsk' && defaultProjectName ? defaultProjectName : null;
  const [projectName, setProjectName] = useState(automaticProject ?? (preference === 'rememberLast' ? (lastProjectName ?? '') : ''));
  const [use, setUse] = useState<LicenseUse>(isMusic(item) ? 'youtube' : licenseUses[0]);
  const [fieldError, setFieldError] = useState<ProjectNameError | null>(null);
  const { run, busy: submitting, error } = useAction((failure) => requestError(failure, text.license.failed));
  const [license, setLicense] = useState<License | null>(null);
  const { status: copyStatus, copy } = useCopy();
  const started = useRef(false); // the automatic license is only requested once
  const free = item.tier === 'free';
  const allowance = accountAllowance(session);
  const limitReached = !free && allowance.remaining === 0;

  // Issues the license, records the download, and starts the (demo) file download.
  const issue = async (name: string) => {
    const result = await run(() => libraryApi.license({ item, projectName: name, use }));
    if (!result.ok) return;
    setAccount(result.data.account);
    setLicense(result.data.license);
    downloadTextFile(`${toFileName(originalTitle(item))}.txt`, fillText(text.license.demoFile, { title: originalTitle(item) }));
  };

  // "Never ask": license for the default project as soon as the dialog opens.
  useEffect(() => {
    if (!automaticProject || started.current || limitReached) return;
    started.current = true;
    void issue(automaticProject);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when the dialog opens
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nameError = validateProjectName(projectName);
    setFieldError(nameError);
    if (nameError || submitting) return;
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
            {isMusic(item) && (
              <Button
                variant="outline"
                onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}-proof.txt`, buildProofLetter(license, user.youtubeChannels, text, locale))}
              >
                <Icon name="shield" size={vars.sizes.icon.sm} />
                {text.downloadsPage.proof}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => downloadTextFile(`${toFileName(license.itemTitle)}-license.txt`, buildLicenseCertificate(license, text, locale))}
            >
              <Icon name="download" size={vars.sizes.icon.sm} />
              {text.license.downloadCertificate}
            </Button>
            <Button onClick={onClose}>{text.common.done}</Button>
          </>
        }
      >
        <Text color={vars.colors.textMuted}>{fillText(text.license.successMessage, { project: license.projectName })}</Text>
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
              { label: text.license.certificate.use, value: text.license.uses[license.use] },
              { label: text.license.certificate.licensee, value: license.licenseeName, autoDirection: true },
              { label: text.license.certificate.issued, value: formatDate(license.issuedAt, locale) },
            ]}
          />
        </Card>
      </Modal>
    );
  }

  // "Never ask" waits on the automatic license (from the first render, before it starts) unless it failed.
  if (automaticProject && !limitReached && !error) {
    return (
      <Modal open={open} onClose={onClose} title={text.license.title}>
        <LoadingState minHeight={vars.sizes.stateMessage.compactMinHeight} label={text.license.submitting} />
      </Modal>
    );
  }

  const allowanceText = free
    ? text.license.allowanceFree
    : allowance.remaining === null
      ? text.license.allowanceUnlimited
      : fillText(allowance.source === 'pass' ? text.license.allowancePass : text.license.allowance, {
          left: formatNumber(allowance.remaining, locale),
        });

  return (
    <Modal open={open} onClose={onClose} title={text.license.title}>
      <Stack as="form" gap={vars.spacing[5]} onSubmit={submit} noValidate>
        <IconNote icon="license" title={item.title[locale]} text={text.license.type} autoDirection />
        <Stack gap={vars.spacing[1]}>
          <Text variant="bodySm">{fillText(text.license.fileSize, { size: formatFileSize(item.fileSize, locale) })}</Text>
          <Text variant="bodySm" color={limitReached ? vars.colors.danger : vars.colors.textMuted}>
            {limitReached ? text.apiErrors.downloadLimitReached : allowanceText}
          </Text>
        </Stack>

        <LicenseSummary />

        {limitReached ? (
          <ModalActions confirmLabel={text.common.viewPlans} confirmTo={routes.pricing} onCancel={onClose} />
        ) : (
          <>
            <Select
              label={text.license.useLabel}
              value={use}
              onChange={(value) => setUse(value as LicenseUse)}
              options={licenseUses.map((option) => ({ value: option, label: text.license.uses[option] }))}
            />
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
            {isMusic(item) && user.youtubeChannels.length === 0 && (
              <Text variant="bodySm" color={vars.colors.textMuted}>
                {text.license.youtubeHint}{' '}
                <TextLink to={accountPath('licensing')} variant="bodySm">
                  {text.license.youtubeSettings}
                </TextLink>
              </Text>
            )}
            <FieldMessage tone="error" message={error} />
            <ModalActions confirmLabel={text.license.submit} confirmIcon="download" submit busy={submitting} busyLabel={text.license.submitting} onCancel={onClose} />
          </>
        )}
      </Stack>
    </Modal>
  );
};

// What the license allows and doesn't, in plain words, before the download.
const LicenseSummary = () => {
  const { text } = useLocale();
  const groups = [
    { title: text.license.canTitle, points: text.license.can, icon: 'check' as const, color: vars.colors.primary },
    { title: text.license.cantTitle, points: text.license.cant, icon: 'close' as const, color: vars.colors.danger },
  ];
  return (
    <Card gap={vars.spacing[3]} padding={vars.spacing[4]} background={vars.colors.surfaceMuted}>
      <Text as="h3" variant="title">
        {text.license.summaryTitle}
      </Text>
      {groups.map((group) => (
        <Stack key={group.title} gap={vars.spacing[1]}>
          <Text as="h4" variant="label" color={vars.colors.textMuted}>
            {group.title}
          </Text>
          <Stack as="ul" gap={vars.spacing[1]}>
            {group.points.map((point) => (
              <Stack key={point} as="li" direction="row" align="flex-start" gap={vars.spacing[2]}>
                <Icon name={group.icon} size={vars.sizes.icon.sm} color={group.color} />
                <Text as="span" variant="bodySm">
                  {point}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Card>
  );
};
