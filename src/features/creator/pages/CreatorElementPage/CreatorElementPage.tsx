import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AsyncContent,
  Button,
  Card,
  Checkbox,
  ChipGroup,
  EmptyState,
  FieldMessage,
  IconNote,
  Modal,
  ModalActions,
  OptionCardGroup,
  Select,
  Stack,
  Text,
  TextField,
  TextLink,
} from '@/shared/components';
import { categoryIds } from '@/shared/types';
import { musicMoods, routes, studioDetailFields, studioLimits, studioNumberDetails, studioSoftware, type StudioDetailKey } from '@/shared/constants';
import { useAction, useAsync, useLocale } from '@/shared/hooks';
import { localeCodes, vars, type Locale } from '@/shared/theme';
import type { CategoryId, StudioElement } from '@/shared/types';
import { fillText, formatNumber, isEditableElement, missingForReview, studioApi, type StudioChanges } from '@/shared/utils';
import { CreatorArea, elementTitle, StudioStatusBadge } from '@/features/creator/components';
import { ElementAppeal } from './ElementAppeal';
import { ElementFiles } from './ElementFiles';
import { ElementSources } from './ElementSources';

const otherLanguage = (language: Locale): Locale => (language === 'en' ? 'ar' : 'en');

// Tags are typed as one line, "ramadan, lantern, gold".
const toTags = (value: string) =>
  value
    .split(/[,،]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, studioLimits.tagsMax);

type Form = Required<Omit<StudioChanges, 'tags' | 'title' | 'description'>> & { title: Record<Locale, string>; description: Record<Locale, string>; tags: Record<Locale, string> };

const formOf = (element: StudioElement): Form => ({
  categoryId: element.categoryId,
  language: element.language,
  title: element.title,
  description: element.description,
  tags: { en: element.tags.en.join(', '), ar: element.tags.ar.join(', ') },
  translationReviewed: element.translationReviewed,
  details: element.details,
  software: element.software,
  bilingual: element.bilingual,
  sources: element.sources,
  noSources: element.noSources,
  contentIdRegistered: element.contentIdRegistered,
});

const changesOf = (form: Form): StudioChanges => ({ ...form, tags: { en: toTags(form.tags.en), ar: toTags(form.tags.ar) } });

// One element: everything about it, what's still missing, and what the creator can do with it now.
export const CreatorElementPage = () => {
  const { text } = useLocale();
  const { id = '' } = useParams();
  const element = useAsync(() => studioApi.element(id), [id], () => false);

  return (
    <CreatorArea section="elements" title={text.studio.editorTitle}>
      <AsyncContent
        state={element}
        error={<EmptyState title={text.studio.editorTitle} message={text.apiErrors.elementNotFound} action={<Button to={routes.creatorElements}>{text.studio.backToElements}</Button>} />}
      >
        {(data) => <ElementEditor key={data.id} initial={data} />}
      </AsyncContent>
    </CreatorArea>
  );
};

const ElementEditor = ({ initial }: { initial: StudioElement }) => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const [element, setElement] = useState(initial);
  const [form, setForm] = useState(() => formOf(initial));
  const [notice, setNotice] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const { run, busy, error } = useAction();
  const t = text.studio;

  const editable = isEditableElement(element);
  const live = element.status === 'live';
  const lockedNotes: Partial<Record<string, string>> = t.lockedNotes;
  const lockedNote = editable ? undefined : lockedNotes[element.status];
  const own = form.language;
  const other = otherLanguage(own);
  const missing = missingForReview({ ...element, ...changesOf(form), tags: { en: toTags(form.tags.en), ar: toTags(form.tags.ar) } } as StudioElement);
  const update = (changes: Partial<Form>) => setForm((current) => ({ ...current, ...changes }));
  const setText = (field: 'title' | 'description', language: Locale, value: string) => update({ [field]: { ...form[field], [language]: value } });

  const save = async () => {
    const result = await run(() => studioApi.save(element.id, changesOf(form)));
    if (result.ok) {
      setElement(result.data);
      setNotice(t.saved);
    }
  };

  // A live element goes back to review with its changes; a draft or element that needs changes is sent as it is.
  const submit = async () => {
    const result = await run(async () => {
      await studioApi.save(element.id, changesOf(form));
      return studioApi.submit(element.id);
    });
    if (result.ok) {
      setElement(result.data);
      setNotice(t.submitted);
    }
  };

  const toggleDisabled = async () => {
    const result = await run(() => studioApi.setDisabled(element.id, element.status === 'live'));
    if (result.ok) setElement(result.data);
  };

  const remove = async () => {
    const result = await run(() => studioApi.remove(element.id));
    if (result.ok) navigate(routes.creatorElements);
  };

  const translate = async () => {
    const result = await run(async () => {
      await studioApi.save(element.id, changesOf(form));
      return studioApi.translate(element.id);
    });
    if (result.ok) {
      setElement(result.data);
      setForm(formOf(result.data));
    }
  };

  const reasons: Record<string, string> = text.admin.reasons;
  const unpublishReasons: Record<string, string> = text.admin.unpublishReasons;
  const moodLabels: Record<string, string> = text.filters.mood.options;

  return (
    <Stack gap={vars.spacing[5]}>
      <TextLink to={routes.creatorElements} variant="bodySm">
        {t.backToElements}
      </TextLink>
      <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
        <Text as="h2" variant="h3" autoDirection>
          {elementTitle(element, t.untitled)}
        </Text>
        <StudioStatusBadge status={element.status} />
      </Stack>

      {/* What the review team said, and why an element was taken down. */}
      {element.review && element.review.decision !== 'accepted' && (
        <Card gap={vars.spacing[2]}>
          <Text as="h3" variant="h4">
            {t.reviewTitle}
          </Text>
          {element.review.reasons.length > 0 && (
            <Text variant="bodySm">
              {t.reviewReasons}: {element.review.reasons.map((reason) => reasons[reason] ?? reason).join(', ')}
            </Text>
          )}
          {element.review.comment && <Text autoDirection>{element.review.comment}</Text>}
        </Card>
      )}
      {element.unpublish && element.status === 'unpublished' && (
        <Card gap={vars.spacing[2]}>
          <Text as="h3" variant="h4">
            {t.unpublishedTitle}
          </Text>
          <Text>{unpublishReasons[element.unpublish.reason] ?? element.unpublish.reason}</Text>
          {element.unpublish.note && <Text autoDirection>{element.unpublish.note}</Text>}
        </Card>
      )}
      <ElementAppeal element={element} onChange={setElement} />
      {lockedNote && <IconNote text={lockedNote} />}
      {(live || element.liveVersion) && <IconNote text={t.liveNote} />}

      <Card gap={vars.spacing[4]}>
        <Text as="h2" variant="h4">
          {t.basics}
        </Text>
        <Select
          label={t.category}
          value={form.categoryId}
          disabled={!editable}
          onChange={(value) => update({ categoryId: value as CategoryId, details: {}, software: [] })}
          options={categoryIds.map((option) => ({ value: option, label: text.categories[option].name }))}
        />
        <Select
          label={t.language}
          value={own}
          disabled={!editable}
          onChange={(value) => update({ language: value as Locale })}
          options={localeCodes.map((option) => ({ value: option, label: text.languageNames[option] }))}
        />
        <TextField label={t.titleLabel} value={form.title[own]} onChange={(value) => setText('title', own, value)} maxLength={studioLimits.titleMaxLength} disabled={!editable} />
        <TextField
          label={t.descriptionLabel}
          value={form.description[own]}
          onChange={(value) => setText('description', own, value)}
          rows={4}
          maxLength={studioLimits.descriptionMaxLength}
          disabled={!editable}
        />
        <TextField
          label={t.tagsLabel}
          hint={fillText(t.tagsHint, { max: formatNumber(studioLimits.tagsMax, locale) })}
          value={form.tags[own]}
          onChange={(value) => update({ tags: { ...form.tags, [own]: value } })}
          disabled={!editable}
        />
      </Card>

      {/* "Review and correct the automatic translations." */}
      <Card gap={vars.spacing[4]}>
        <Stack gap={vars.spacing[1]}>
          <Text as="h2" variant="h4">
            {t.translationTitle}
          </Text>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {t.translationText}
          </Text>
        </Stack>
        {editable && (
          <div>
            <Button variant="outline" disabled={busy || !form.title[own].trim()} onClick={() => void translate()}>
              {t.translate}
            </Button>
          </div>
        )}
        <IconNote text={t.translationNote} />
        <Text variant="title">{fillText(t.otherLanguage, { language: text.languageNames[other] })}</Text>
        <TextField label={t.titleLabel} value={form.title[other]} onChange={(value) => setText('title', other, value)} disabled={!editable} />
        <TextField label={t.descriptionLabel} value={form.description[other]} onChange={(value) => setText('description', other, value)} rows={4} disabled={!editable} />
        <TextField label={t.tagsLabel} value={form.tags[other]} onChange={(value) => update({ tags: { ...form.tags, [other]: value } })} disabled={!editable} />
        <Checkbox label={t.translationReviewed} checked={form.translationReviewed} disabled={!editable} onChange={(checked) => update({ translationReviewed: checked })} />
      </Card>

      {/* Details for this kind of element, the software it works with, and whether it's bilingual. */}
      <Card gap={vars.spacing[4]}>
        <Text as="h2" variant="h4">
          {t.detailsTitle}
        </Text>
        {studioDetailFields[form.categoryId].map((key: StudioDetailKey) =>
          key === 'mood' ? (
            <Select
              key={key}
              label={t.details.mood}
              value={form.details.mood ?? musicMoods[0]}
              disabled={!editable}
              onChange={(value) => update({ details: { ...form.details, mood: value } })}
              options={musicMoods.map((mood) => ({ value: mood, label: moodLabels[mood] ?? mood }))}
            />
          ) : (
            <TextField
              key={key}
              label={t.details[key]}
              value={form.details[key] ?? ''}
              inputMode={studioNumberDetails.includes(key) ? 'numeric' : 'text'}
              direction={studioNumberDetails.includes(key) ? 'ltr' : 'auto'}
              disabled={!editable}
              onChange={(value) => update({ details: { ...form.details, [key]: value } })}
            />
          ),
        )}
        <ChipGroup
          label={t.softwareLabel}
          multiple
          value={form.software}
          onChange={(value) => editable && update({ software: value })}
          options={studioSoftware[form.categoryId].map((name) => ({ value: name, label: name }))}
        />
        <Checkbox label={t.bilingual} checked={form.bilingual} disabled={!editable} onChange={(checked) => update({ bilingual: checked })} />
      </Card>

      <ElementFiles element={element} editable={editable} onChange={setElement} />

      <ElementSources sources={form.sources} noSources={form.noSources} editable={editable} onChange={(changes) => update(changes)} />

      {form.categoryId === 'music' && (
        <Card gap={vars.spacing[3]}>
          <Text as="h2" variant="h4">
            {t.contentIdTitle}
          </Text>
          <OptionCardGroup<'yes' | 'no'>
            label={t.contentIdTitle}
            value={form.contentIdRegistered === null ? undefined : form.contentIdRegistered ? 'yes' : 'no'}
            onChange={(value) => editable && update({ contentIdRegistered: value === 'yes' })}
            options={[
              { value: 'yes', title: t.contentIdYes },
              { value: 'no', title: t.contentIdNo },
            ]}
          />
        </Card>
      )}

      {editable && missing.length > 0 && (
        <Card gap={vars.spacing[2]}>
          <Text as="h2" variant="h4">
            {t.missingTitle}
          </Text>
          <Stack as="ul" gap={vars.spacing[1]}>
            {missing.map((key) => (
              <li key={key}>
                <Text variant="bodySm">{t.missing[key]}</Text>
              </li>
            ))}
          </Stack>
        </Card>
      )}

      {notice && <IconNote icon="check" text={notice} />}
      <FieldMessage tone="error" message={error} />
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        {editable && !live && (
          <Button variant="outline" disabled={busy} onClick={() => void save()}>
            {t.saveDraft}
          </Button>
        )}
        {editable && (
          <Button disabled={busy || missing.length > 0} onClick={() => void submit()}>
            {live ? t.submitUpdate : element.status === 'softRejected' ? t.resubmit : t.submit}
          </Button>
        )}
        {(live || element.status === 'disabled') && (
          <Button variant="outline" disabled={busy} onClick={() => void toggleDisabled()}>
            {element.status === 'live' ? t.disable : t.enable}
          </Button>
        )}
        <Button variant="danger" disabled={busy} onClick={() => setDeleting(true)}>
          {t.delete}
        </Button>
      </Stack>

      {deleting && (
        <Modal open onClose={() => setDeleting(false)} title={t.deleteTitle}>
          <Text>{t.deleteText}</Text>
          <ModalActions confirmLabel={t.delete} tone="danger" busy={busy} onCancel={() => setDeleting(false)} onConfirm={() => void remove()} />
        </Modal>
      )}
    </Stack>
  );
};
