import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { flagElement, reviewElement } from '@/features/admin/api';
import { guidelineChecks, statusTone } from '@/features/admin/constants';
import { flashState, useAdminSession, useAdminAction } from '@/features/admin/hooks';
import type {
  CatalogElement,
  FlagInput,
  GuidelineCheck,
  RejectDecision,
  RejectReason,
  ReviewDecision,
} from '@/features/admin/types';
import { previewKind, toggleItem, totalFileSize } from '@/features/admin/utils';
import { Badge, Button, Card, Checkbox, DetailList, MediaPreview, Notice, SectionHeader, SplitLayout, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatFileSize, formatList, formatNumber, isolate } from '@/shared/utils';
import { FlagModal } from './FlagModal';
import { RejectModal } from './RejectModal';

type Dialog = RejectDecision | 'flag' | null;

export const ReviewElementView = ({ element: loaded }: { element: CatalogElement }) => {
  const { text, locale } = useLocale();
  const { currentAdmin, admins } = useAdminSession();
  const navigate = useNavigate();
  const t = text.admin.review;

  const [element, setElement] = useState(loaded);
  const [checks, setChecks] = useState<GuidelineCheck[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const { run, busy: pending, error, clearError } = useAdminAction();
  const [flagged, setFlagged] = useState(false);

  const isPending = element.status === 'pending';
  const allChecked = guidelineChecks.every((check) => checks.includes(check));

  const openDialog = (next: Dialog) => {
    clearError();
    setDialog(next);
  };

  const submitReview = async (decision: ReviewDecision, reasons: RejectReason[] = [], comment = '') => {
    const result = await run(() => reviewElement(currentAdmin.id, element.id, { decision, reasons, comment }));
    if (!result.ok) return;
    // Go straight to the next element waiting, or back to the queue when it's empty.
    const { nextId } = result.data;
    const next = nextId ? generatePath(routes.adminReviewElement, { elementId: nextId }) : routes.adminReview;
    navigate(next, { state: flashState(decision) });
  };

  const submitFlag = async (input: FlagInput) => {
    const result = await run(() => flagElement(currentAdmin.id, element.id, input));
    if (!result.ok) return;
    setElement(result.data);
    setDialog(null);
    setFlagged(true);
  };

  const reviewer = admins.find((admin) => admin.id === element.review?.adminId);

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1"
        title={element.title}
        subtitle={fillText(t.byCreator, { name: isolate(element.creator.name) })}
        autoDirection
        badges={
          <>
            <Badge variant={statusTone[element.status]}>{text.admin.statuses[element.status]}</Badge>
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

      <SplitLayout
        stickyAside={false}
        main={
        <Stack>
          <MediaPreview kind={previewKind(element.type)} src={element.previewUrl} alt={element.title} />

          <Card title={t.details}>
            <DetailList
              rows={[
                { label: t.description, value: element.description, autoDirection: true },
                { label: text.admin.columns.category, value: text.categories[element.category].name },
                { label: t.software, value: element.software.length ? formatList(element.software, locale) : t.noSoftware },
                { label: t.bilingual, value: element.bilingual ? t.yes : t.no },
                {
                  label: t.tags,
                  value: (
                    <Stack as="ul" direction="row" wrap gap={vars.spacing[2]}>
                      {element.tags.map((tag) => (
                        <li key={tag}>
                          <Badge>
                            <bdi>{tag}</bdi>
                          </Badge>
                        </li>
                      ))}
                    </Stack>
                  ),
                },
                { label: text.admin.columns.submitted, value: formatDate(element.submittedAt, locale) },
                { label: t.version, value: formatNumber(element.version, locale) },
              ]}
            />
          </Card>

          <Card title={t.files}>
            <Stack as="ul" gap={vars.spacing[2]}>
              {element.files.map((file) => (
                <Stack key={file.name} as="li" direction="row" wrap justify="space-between" gap={vars.spacing[3]}>
                  <Text as="span">
                    <bdi>{file.name}</bdi>
                  </Text>
                  <Text as="span" color={vars.colors.textMuted}>
                    {formatFileSize(file.sizeBytes, locale)}
                  </Text>
                </Stack>
              ))}
            </Stack>
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.totalSize, { size: formatFileSize(totalFileSize(element), locale) })}
            </Text>
          </Card>

          <Card title={t.sources}>
            {element.sources.length ? (
              <Stack as="ul" gap={vars.spacing[2]}>
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
              </Stack>
            ) : (
              <Text color={vars.colors.textMuted}>{t.noSources}</Text>
            )}
          </Card>
        </Stack>
        }
        aside={
        <Stack>
          {element.flag && (
            <Notice tone="warning">
              {fillText(t.flaggedAs, { kind: text.admin.flagKinds[element.flag.kind] })}
              {element.flag.note && (
                <Text as="span" autoDirection>
                  {element.flag.note}
                </Text>
              )}
            </Notice>
          )}

          {element.similarTo && (
            <Card title={t.similarTitle}>
              <Text>{t.similarMessage}</Text>
              <Text autoDirection>
                <strong>{element.similarTo.title}</strong>
              </Text>
            </Card>
          )}

          {isPending ? (
            <>
              <Card title={t.guidelinesTitle}>
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
              </Card>

              <Card title={t.decisionTitle}>
                <Stack direction="row" wrap gap={vars.spacing[3]}>
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
                </Stack>
              </Card>
            </>
          ) : (
            element.review && (
              <Card title={t.reviewedTitle}>
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
              </Card>
            )
          )}
        </Stack>
        }
      />

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
