import { useState, type FormEvent } from 'react';
import { fetchLegalPages, saveLegalPage } from '@/features/admin/api';
import { LocalizedField } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { LegalPage } from '@/features/admin/types';
import { hasErrors, localized, localizedErrors, replaceById } from '@/features/admin/utils';
import { AsyncContent, Button, Card, Icon, Modal, ModalActions, Notice, Stack, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, isolate } from '@/shared/utils';

interface LegalModalProps {
  page: LegalPage;
  onClose: () => void;
  onSaved: (page: LegalPage) => void;
}

const LegalModal = ({ page, onClose, onSaved }: LegalModalProps) => {
  const { text } = useLocale();
  const { currentAdmin } = useAdminSession();
  const { run, busy: pending, error } = useAdminAction();
  const t = text.admin.content.legal;
  const [body, setBody] = useState(page.body);
  const [submitted, setSubmitted] = useState(false);
  const errors = localizedErrors(body, text);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;
    const result = await run(() => saveLegalPage(currentAdmin.id, page.id, body));
    if (result.ok) onSaved(result.data);
  };

  return (
    <Modal
      open
      title={fillText(t.editTitle, { page: text.admin.content.legalPages[page.id] })}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <ModalActions confirmLabel={text.common.saveChanges} onCancel={onClose} submit busy={pending} />
      }
    >
      <Text color={vars.colors.textMuted}>{t.editMessage}</Text>
      {error && <Notice tone="danger">{error}</Notice>}
      <LocalizedField
        label={t.bodyLabel}
        hint={t.bodyHint}
        value={body}
        onChange={setBody}
        multiline
        errors={submitted ? errors : {}}
        required
      />
    </Modal>
  );
};

// Terms, privacy and license pages. Each shows when it was last changed and by whom.
export const LegalTab = () => {
  const { text, locale } = useLocale();
  const pages = useAsync(fetchLegalPages, []);
  const [editing, setEditing] = useState<LegalPage | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.content.legal;

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={pages}>
        {(list) => (
          <Stack>
            {list.map((page) => (
              <Card key={page.id} title={text.admin.content.legalPages[page.id]}>
                <Text color={vars.colors.textMuted}>
                  {fillText(t.updated, { date: formatDate(page.updatedAt, locale), name: isolate(page.updatedBy ?? text.admin.content.siteTeam) })}
                </Text>
                <Text autoDirection>{localized(page.body, locale)}</Text>
                <Stack direction="row" wrap>
                  <Button size="sm" variant="outline" iconOnly tooltip={text.admin.common.edit} tooltipAlign="end" onClick={() => setEditing(page)}>
                    <Icon name="pencil" size={vars.sizes.icon.sm} />
                  </Button>
                </Stack>
              </Card>
            ))}
            {editing && (
              <LegalModal
                page={editing}
                onClose={() => setEditing(null)}
                onSaved={(saved) => {
                  pages.update(replaceById(list, saved));
                  setEditing(null);
                  setNotice(fillText(t.saved, { page: text.admin.content.legalPages[saved.id] }));
                }}
              />
            )}
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
};
