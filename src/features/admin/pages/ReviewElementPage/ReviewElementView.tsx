import { useState, type ReactNode } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { flagElement, reviewElement } from '@/features/admin/api';
import { Badge, Checkbox, MediaPreview, Notice, PageHeader, Panel, Stack } from '@/features/admin/components';
import { guidelineChecks, statusTone } from '@/features/admin/constants';
import { flashState, useAdminSession } from '@/features/admin/hooks';
import type {
  CatalogElement,
  FlagInput,
  GuidelineCheck,
  RejectDecision,
  RejectReason,
  ReviewDecision,
} from '@/features/admin/types';
import {
  errorMessage,
  fillText,
  formatList,
  isolate,
  previewKind,
  toggleItem,
  totalFileSize,
} from '@/features/admin/utils';
import { Button, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatFileSize, formatNumber, safeAsync } from '@/shared/utils';
import { FlagModal } from './FlagModal';
import { RejectModal } from './RejectModal';
import styles from './ReviewElementPage.module.css';

type Dialog = RejectDecision | 'flag' | null;

// One labelled value in the details list.
const Detail = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.detail}>
    <dt>
      <Text as="span" variant="label" color={vars.colors.textMuted}>
        {label}
      </Text>
    </dt>
    <dd className={styles.value}>{children}</dd>
  </div>
);

export const ReviewElementView = ({ element: loaded }: { element: CatalogElement }) => {
  const { text, locale } = useLocale();
  const { currentAdmin, admins } = useAdminSession();
  const navigate = useNavigate();
  const t = text.admin.review;

  const [element, setElement] = useState(loaded);
  const [checks, setChecks] = useState<GuidelineCheck[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flagged, setFlagged] = useState(false);

  const isPending = element.status === 'pending';
  const allChecked = guidelineChecks.every((check) => checks.includes(check));

  const openDialog = (next: Dialog) => {
    setError(null);
    setDialog(next);
  };

  const submitReview = async (decision: ReviewDecision, reasons: RejectReason[] = [], comment = '') => {
    setPending(true);
    setError(null);
    const result = await safeAsync(() =>
      reviewElement(currentAdmin.id, element.id, { decision, reasons, comment }),
    );
    setPending(false);
    if (!result.ok) {
      setError(errorMessage(result.error, text));
      return;
    }
    // Go straight to the next element waiting, or back to the queue when it's empty.
    const { nextId } = result.data;
    const next = nextId ? generatePath(routes.adminReviewElement, { elementId: nextId }) : routes.adminReview;
    navigate(next, { state: flashState(decision) });
  };

  const submitFlag = async (input: FlagInput) => {
    setPending(true);
    setError(null);
    const result = await safeAsync(() => flagElement(currentAdmin.id, element.id, input));
    setPending(false);
    if (!result.ok) {
      setError(errorMessage(result.error, text));
      return;
    }
    setElement(result.data);
    setDialog(null);
    setFlagged(true);
  };

  const reviewer = admins.find((admin) => admin.id === element.review?.adminId);

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader
        title={element.title}
        description={fillText(t.byCreator, { name: isolate(element.creator.name) })}
        autoDirection
        actions={
          <>
            <Badge tone={statusTone[element.status]}>{text.admin.statuses[element.status]}</Badge>
            <Badge>{text.admin.elementTypes[element.type]}</Badge>
          </>
        }
      />

      {flagged && (
        <Notice tone="success" onDismiss={() => setFlagged(false)}>
          {text.admin.notices.flagged}
        </Notice>
      )}
      {error && !dialog && <Notice tone="danger">{error}</Notice>}

      <div className={styles.layout}>
        <Stack>
          <MediaPreview kind={previewKind(element.type)} src={element.previewUrl} alt={element.title} />

          <Panel title={t.details}>
            <dl className={styles.details}>
              <Detail label={t.description}>
                <Text autoDirection>{element.description}</Text>
              </Detail>
              <Detail label={text.admin.columns.category}>{text.admin.categories[element.category]}</Detail>
              <Detail label={t.software}>
                {element.software.length ? formatList(element.software, locale) : t.noSoftware}
              </Detail>
              <Detail label={t.bilingual}>{element.bilingual ? t.yes : t.no}</Detail>
              <Detail label={t.tags}>
                <span className={styles.tags}>
                  {element.tags.map((tag) => (
                    <Badge key={tag}>
                      <bdi>{tag}</bdi>
                    </Badge>
                  ))}
                </span>
              </Detail>
              <Detail label={text.admin.columns.submitted}>{formatDate(element.submittedAt, locale)}</Detail>
              <Detail label={t.version}>{formatNumber(element.version, locale)}</Detail>
            </dl>
          </Panel>

          <Panel title={t.files}>
            <ul className={styles.list}>
              {element.files.map((file) => (
                <li key={file.name} className={styles.fileRow}>
                  <Text as="span">
                    <bdi>{file.name}</bdi>
                  </Text>
                  <Text as="span" color={vars.colors.textMuted}>
                    {formatFileSize(file.sizeBytes, locale)}
                  </Text>
                </li>
              ))}
            </ul>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.totalSize, { size: formatFileSize(totalFileSize(element), locale) })}
            </Text>
          </Panel>

          <Panel title={t.sources}>
            {element.sources.length ? (
              <ul className={styles.list}>
                {element.sources.map((source) => (
                  <li key={`${source.kind}-${source.name}`}>
                    <Text>
                      {fillText(t.sourceLine, {
                        kind: text.admin.sources[source.kind],
                        name: isolate(source.name),
                        license: source.license,
                      })}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : (
              <Text color={vars.colors.textMuted}>{t.noSources}</Text>
            )}
          </Panel>
        </Stack>

        <Stack>
          {element.flag && (
            <Notice tone="warning">
              {fillText(t.flaggedAs, { kind: text.admin.flagKinds[element.flag.kind] })}
              {element.flag.note && <bdi className={styles.block}>{element.flag.note}</bdi>}
            </Notice>
          )}

          {element.similarTo && (
            <Panel title={t.similarTitle}>
              <Text>{t.similarMessage}</Text>
              <Text autoDirection>
                <strong>{element.similarTo.title}</strong>
              </Text>
            </Panel>
          )}

          {isPending ? (
            <>
              <Panel title={t.guidelinesTitle}>
                <Text variant="bodySm" color={vars.colors.textMuted}>
                  {t.guidelinesHint}
                </Text>
                {guidelineChecks.map((check) => (
                  <Checkbox
                    key={check}
                    label={text.admin.guidelines[check]}
                    checked={checks.includes(check)}
                    onChange={() => setChecks(toggleItem(checks, check))}
                  />
                ))}
              </Panel>

              <Panel title={t.decisionTitle}>
                <div className={styles.actions}>
                  <Button disabled={!allChecked || pending} onClick={() => submitReview('accepted')}>
                    {t.accept}
                  </Button>
                  <Button variant="highlight" disabled={pending} onClick={() => openDialog('softRejected')}>
                    {t.softReject}
                  </Button>
                  <Button variant="danger" disabled={pending} onClick={() => openDialog('hardRejected')}>
                    {t.hardReject}
                  </Button>
                  {!element.flag && (
                    <Button variant="muted" disabled={pending} onClick={() => openDialog('flag')}>
                      {t.flag}
                    </Button>
                  )}
                </div>
              </Panel>
            </>
          ) : (
            element.review && (
              <Panel title={t.reviewedTitle}>
                <Text>
                  {fillText(t.reviewedBy, {
                    name: isolate(reviewer?.name ?? ''),
                    date: formatDate(element.review.at, locale),
                  })}
                </Text>
                {element.review.reasons.length > 0 && (
                  <Text>
                    {fillText(t.reasonsList, {
                      list: formatList(
                        element.review.reasons.map((reason) => text.admin.reasons[reason]),
                        locale,
                      ),
                    })}
                  </Text>
                )}
                {element.review.comment && (
                  <Text>{fillText(t.commentText, { comment: isolate(element.review.comment) })}</Text>
                )}
              </Panel>
            )
          )}
        </Stack>
      </div>

      {(dialog === 'softRejected' || dialog === 'hardRejected') && (
        <RejectModal
          decision={dialog}
          pending={pending}
          error={error}
          onClose={() => setDialog(null)}
          onSubmit={(reasons, comment) => submitReview(dialog, reasons, comment)}
        />
      )}
      {dialog === 'flag' && (
        <FlagModal pending={pending} error={error} onClose={() => setDialog(null)} onSubmit={submitFlag} />
      )}
    </Stack>
  );
};
