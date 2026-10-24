import type {
  AttributeInput,
  CatalogElement,
  Category,
  CategoryInput,
  DeprecateInput,
  LocalizedText,
  MoveDirection,
  Tag,
} from '@/features/admin/types';
import { monthsBefore } from '@/features/admin/utils/dates';
import { moveItem, sameText } from '@/features/admin/utils/lists';
import { trimLocalized } from '@/features/admin/utils/validation';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

const categoryTarget = (category: Category) => ({
  kind: 'category' as const,
  id: category.id,
  label: category.name.en,
  labels: category.name,
});

const isSibling = (category: Category) => (other: Category) => other.parentId === category.parentId;

// Categories in display order: each parent is followed by its subcategories on the page.
export const fetchCategories = () => respond(() => db.categories);

// null when the category doesn't exist: the page shows "Category not found".
export const fetchCategory = (id: string) => respond(() => db.categories.find((category) => category.id === id) ?? null);

// Only two levels: a subcategory's parent must be a top-level category.
export const createCategory = (actorId: string, input: CategoryInput) =>
  respond((): Category => {
    const actor = authorize(actorId, 'manageCatalog');
    if (input.parentId && findById(db.categories, input.parentId).parentId) throw new AdminApiError('notFound');

    const category: Category = {
      id: newId(),
      name: trimLocalized(input.name),
      parentId: input.parentId,
      hidden: false,
      attributes: [],
    };
    db.categories.push(category);
    logAction(actor, 'categoryCreated', categoryTarget(category));
    return category;
  });

export const renameCategory = (actorId: string, id: string, name: LocalizedText) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, id);
    category.name = trimLocalized(name);
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: 'details' });
    return category;
  });

// Moves a category above or below its neighbor with the same parent.
export const moveCategory = (actorId: string, id: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, id);
    db.categories = moveItem(db.categories, id, direction, isSibling(category));
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: 'moved' });
    return db.categories;
  });

// Hidden categories and their subcategories don't show on the site. Their elements stay live.
export const setCategoryHidden = (actorId: string, id: string, hidden: boolean) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, id);
    category.hidden = hidden;
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: hidden ? 'hidden' : 'shown' });
    return category;
  });

// Adds an attribute, or updates it when an attributeId is given.
export const saveAttribute = (actorId: string, categoryId: string, input: AttributeInput, attributeId?: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, categoryId);
    const attribute = {
      ...input,
      name: trimLocalized(input.name),
      options: input.options.map((option) => option.trim()).filter(Boolean),
    };
    if (attributeId) {
      Object.assign(findById(category.attributes, attributeId), attribute);
    } else {
      category.attributes.push({ id: newId(), ...attribute });
    }
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: 'attributes' });
    return category;
  });

export const removeAttribute = (actorId: string, categoryId: string, attributeId: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, categoryId);
    findById(category.attributes, attributeId);
    category.attributes = category.attributes.filter((attribute) => attribute.id !== attributeId);
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: 'attributes' });
    return category;
  });

export const moveAttribute = (actorId: string, categoryId: string, attributeId: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const category = findById(db.categories, categoryId);
    category.attributes = moveItem(category.attributes, attributeId, direction);
    logAction(actor, 'categoryUpdated', categoryTarget(category), { change: 'attributes' });
    return category;
  });

const tagTarget = (name: string) => ({ kind: 'tag' as const, id: name, label: name });

const tagUsage = (name: string) => db.elements.filter((element) => element.tags.includes(name)).length;

// Replaces a tag on every element that has it, without listing the same tag twice.
const replaceTag = (from: string, to: string | null) => {
  db.elements.forEach((element) => {
    if (!element.tags.includes(from)) return;
    const tags = element.tags.flatMap((tag) => (tag === from ? (to ? [to] : []) : [tag]));
    element.tags = [...new Set(tags)];
  });
};

// Most used first. Every tag change returns the whole list, since usage counts change too.
const listTags = (): Tag[] =>
  db.tags.map((tag) => ({ ...tag, usage: tagUsage(tag.name) })).sort((a, b) => b.usage - a.usage);

export const fetchTags = () => respond(listTags);

export const renameTag = (actorId: string, id: string, name: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const tag = findById(db.tags, id);
    const newName = name.trim();
    if (db.tags.some((other) => other.id !== id && sameText(other.name, newName))) throw new AdminApiError('tagExists');

    replaceTag(tag.name, newName);
    logAction(actor, 'tagRenamed', tagTarget(newName), { from: tag.name, to: newName });
    tag.name = newName;
    return listTags();
  });

// Moves every element from one tag to another, then deletes the first tag.
export const mergeTags = (actorId: string, sourceId: string, targetId: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    if (sourceId === targetId) throw new AdminApiError('sameTag');
    const source = findById(db.tags, sourceId);
    const target = findById(db.tags, targetId);

    replaceTag(source.name, target.name);
    db.tags = db.tags.filter((tag) => tag.id !== sourceId);
    logAction(actor, 'tagsMerged', tagTarget(target.name), { from: source.name, to: target.name });
    return listTags();
  });

// A banned tag is removed from every element, and creators can't add it again.
export const setTagBanned = (actorId: string, id: string, banned: boolean) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const tag = findById(db.tags, id);
    tag.banned = banned;
    if (banned) replaceTag(tag.name, null);
    logAction(actor, banned ? 'tagBanned' : 'tagUnbanned', tagTarget(tag.name));
    return listTags();
  });

const lastActivity = (element: CatalogElement) => element.lastDownloadedAt ?? element.publishedAt ?? element.submittedAt;

// Live elements older than the period with no downloads during it, least recently downloaded first.
export const fetchUnusedElements = (months: number) =>
  respond(() => {
    const cutoff = monthsBefore(months).toISOString();
    return db.elements
      .filter((element) => element.status === 'live' && lastActivity(element) < cutoff)
      .sort((a, b) => lastActivity(a).localeCompare(lastActivity(b)));
  });

// Takes an old element out of search and browsing. Existing licenses stay valid.
export const deprecateElement = (actorId: string, elementId: string, input: DeprecateInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageCatalog');
    const element = findById(db.elements, elementId);
    if (element.status !== 'live') throw new AdminApiError('notLive');

    element.status = 'deprecated';
    element.deprecation = { ...input, adminId: actor.id, at: now() };
    logAction(actor, 'elementDeprecated', { kind: 'element', id: element.id, label: element.title }, {
      deprecateReason: input.reason,
      note: input.note || undefined,
    });
    return element;
  });
