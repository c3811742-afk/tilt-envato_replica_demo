import type {
  Admin,
  AuditArea,
  AuditChange,
  Banner,
  BannerInput,
  FeaturedKind,
  FeaturedSlot,
  MoveDirection,
  Occasion,
  OccasionInput,
} from '@/features/admin/types';
import { maxFreeElements } from '@/features/admin/constants/catalog';
import { moveItem } from '@/features/admin/utils/lists';
import { trimLocalized } from '@/features/admin/utils/validation';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, respond } from './mockServer';

// Every homepage change is logged against the homepage, with the tab it was made in.
const logHomepage = (actor: Admin, area: AuditArea, label: string, change: AuditChange = 'details') =>
  logAction(actor, 'homepageUpdated', { kind: 'homepage', id: area, label }, { area, change });

export const fetchFeatured = () => respond(() => db.featured);

export const fetchCollections = () => respond(() => db.collections);

export const addFeatured = (actorId: string, kind: FeaturedKind, refId: string) =>
  respond((): FeaturedSlot[] => {
    const actor = authorize(actorId, 'manageHomepage');
    if (db.featured.some((slot) => slot.kind === kind && slot.refId === refId)) throw new AdminApiError('alreadyFeatured');
    const title =
      kind === 'element' ? findById(db.elements, refId).title : findById(db.collections, refId).title;

    db.featured.push({ id: newId(), kind, refId, title });
    logHomepage(actor, 'featured', title, 'added');
    return db.featured;
  });

export const removeFeatured = (actorId: string, slotId: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const slot = findById(db.featured, slotId);
    db.featured = db.featured.filter((current) => current.id !== slotId);
    logHomepage(actor, 'featured', slot.title, 'removed');
    return db.featured;
  });

export const moveFeatured = (actorId: string, slotId: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const slot = findById(db.featured, slotId);
    db.featured = moveItem(db.featured, slotId, direction);
    logHomepage(actor, 'featured', slot.title, 'moved');
    return db.featured;
  });

// Sorted by start date, so the calendar reads in order.
export const fetchOccasions = () =>
  respond(() => [...db.occasions].sort((a, b) => a.startDate.localeCompare(b.startDate)));

// Adds an occasion, or updates it when an id is given.
export const saveOccasion = (actorId: string, input: OccasionInput, id?: string) =>
  respond((): Occasion => {
    const actor = authorize(actorId, 'manageHomepage');
    const values = { ...input, name: trimLocalized(input.name), headline: trimLocalized(input.headline) };
    const occasion = id ? Object.assign(findById(db.occasions, id), values) : { id: newId(), ...values };
    if (!id) db.occasions.push(occasion);
    logHomepage(actor, 'occasions', occasion.name.en, id ? 'details' : 'added');
    return occasion;
  });

export const deleteOccasion = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const occasion = findById(db.occasions, id);
    db.occasions = db.occasions.filter((current) => current.id !== id);
    logHomepage(actor, 'occasions', occasion.name.en, 'removed');
    return occasion;
  });

// The free elements chosen for a month (YYYY-MM). An empty list when none are chosen yet.
export const fetchFreeElements = (month: string) =>
  respond(() => db.freeElements.find((entry) => entry.month === month)?.elementIds ?? []);

export const saveFreeElements = (actorId: string, month: string, elementIds: string[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    if (elementIds.length > maxFreeElements) throw new AdminApiError('tooManyFree');
    elementIds.forEach((id) => {
      if (findById(db.elements, id).status !== 'live') throw new AdminApiError('notLive');
    });

    db.freeElements = [...db.freeElements.filter((entry) => entry.month !== month), { month, elementIds }];
    logHomepage(actor, 'freeElements', month);
    return elementIds;
  });

export const fetchBanners = () =>
  respond(() => [...db.banners].sort((a, b) => a.startDate.localeCompare(b.startDate)));

export const saveBanner = (actorId: string, input: BannerInput, id?: string) =>
  respond((): Banner => {
    const actor = authorize(actorId, 'manageHomepage');
    const values = { ...input, text: trimLocalized(input.text), link: input.link.trim() };
    const banner = id ? Object.assign(findById(db.banners, id), values) : { id: newId(), ...values };
    if (!id) db.banners.push(banner);
    logHomepage(actor, 'banners', banner.text.en, id ? 'details' : 'added');
    return banner;
  });

export const deleteBanner = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const banner = findById(db.banners, id);
    db.banners = db.banners.filter((current) => current.id !== id);
    logHomepage(actor, 'banners', banner.text.en, 'removed');
    return banner;
  });
