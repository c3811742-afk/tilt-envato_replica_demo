import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { AsyncContent, Button, Card, DetailList, FieldMessage, Icon, Page, Stack, Text, TextField, TextLink, stateMessageHeights } from '@/shared/components';
import { licenseCheckParam } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { LicenseRecord } from '@/shared/types';
import { fillText, formatDate, libraryApi } from '@/shared/utils';

// "A guest checks a license by its code": anyone (a client, YouTube, a printer) can see if a license is real.
// The link printed on certificates opens this page with the code filled in.
export const LicenseCheckPage = () => {
  const { text } = useLocale();
  const [params, setParams] = useSearchParams();
  const linkedCode = params.get(licenseCheckParam) ?? '';
  const [code, setCode] = useState(linkedCode);
  const [codeError, setCodeError] = useState<string>();
  // The code being checked: from the link on a certificate, or the last one the user entered.
  const [checkedCode, setCheckedCode] = useState(linkedCode.trim());
  const lookup = useAsync(() => (checkedCode ? libraryApi.checkLicense(checkedCode) : Promise.resolve(undefined)), [checkedCode], () => false);

  const check = (value: string) => {
    if (!value.trim()) {
      setCodeError(text.validation.required);
      return;
    }
    setCodeError(undefined);
    setCheckedCode(value.trim());
    setParams({ [licenseCheckParam]: value.trim() }, { replace: true });
    if (value.trim() === checkedCode) lookup.retry();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    check(code);
  };

  return (
    <Page title={text.licenseCheck.title} subtitle={text.licenseCheck.subtitle} contentMaxWidth={vars.sizes.readable.maxWidth}>
      <Stack as="form" gap={vars.spacing[3]} onSubmit={submit} noValidate>
        <TextField
          label={text.licenseCheck.codeLabel}
          placeholder={text.licenseCheck.codePlaceholder}
          direction="ltr"
          value={code}
          onChange={setCode}
          error={codeError}
          autoFocus
        />
        <Stack direction="row" wrap align="center" gap={vars.spacing[4]}>
          <Button type="submit" disabled={lookup.status === 'loading' && Boolean(checkedCode)}>
            {text.licenseCheck.check}
          </Button>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {text.licenseCheck.sample}{' '}
            <TextLink
              variant="bodySm"
              onClick={() => {
                setCode(libraryApi.sampleLicenseCode);
                check(libraryApi.sampleLicenseCode);
              }}
            >
              <bdi>{libraryApi.sampleLicenseCode}</bdi>
            </TextLink>
          </Text>
        </Stack>
      </Stack>

      {checkedCode && (
        <AsyncContent state={lookup} minHeight={stateMessageHeights.compact}>
          {(license) => (license ? <LicenseResult license={license} /> : <FieldMessage tone="error" message={text.licenseCheck.notFound} />)}
        </AsyncContent>
      )}
    </Page>
  );
};

// A license as the license server has it: valid or revoked (with why), and its details.
const LicenseResult = ({ license }: { license: LicenseRecord }) => {
  const { text, locale } = useLocale();
  return (
    <Card gap={vars.spacing[4]} borderColor={license.revoked ? vars.colors.border : vars.colors.primary}>
      <Stack direction="row" align="center" gap={vars.spacing[3]}>
        <Icon name={license.revoked ? 'close' : 'check'} color={license.revoked ? vars.colors.danger : vars.colors.primary} />
        <Text as="h2" variant="h3">
          {license.revoked ? text.licenseCheck.revoked : text.licenseCheck.valid}
        </Text>
      </Stack>
      {license.revoked && (
        <Text>{fillText(text.licenseCheck.revokedOn, { date: formatDate(license.revoked.at, locale), reason: text.revokeReasons[license.revoked.reason] })}</Text>
      )}
      <DetailList
        rows={[
          { label: text.license.certificate.code, value: license.code },
          { label: text.license.certificate.item, value: license.itemTitle, autoDirection: true },
          { label: text.license.certificate.creator, value: license.creatorName, autoDirection: true },
          { label: text.license.certificate.licensee, value: license.licenseeName, autoDirection: true },
          { label: text.license.certificate.project, value: license.projectName, autoDirection: true },
          { label: text.license.certificate.use, value: text.license.uses[license.use] },
          { label: text.license.certificate.issued, value: formatDate(license.issuedAt, locale) },
        ]}
      />
      {license.itemRemoved && !license.revoked && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.licenseCheck.removedNote}
        </Text>
      )}
    </Card>
  );
};
