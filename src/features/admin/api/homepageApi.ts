import type {
  Admin,
  AuditArea,
  AuditChange,
  Banner,
  BannerInput,
  Collection,
  FeaturedKind,
  FeaturedSlot,
  MoveDirection,
  Occasion,
  OccasionInput,
} from '@/features/admin/types';
import { maxFreeElements } from '@/features/admin/constants/catalog';
import { moveItem } from '@/features/admin/utils/lists';
import { trimLocalized } from '@/features/admin/utils/validation';
import { mockCollections } from '@/shared/mocks';
import type { HomepageSettings } from '@/shared/types';
import { homepageStore } from '@/shared/utils';
import { allElements } from './elementsApi';
import { AdminApiError } from './errors';
import { authorize, findById, logAction, newId, respond } from './mockServer';

// The home page settings are the site's own: what is saved here is what customers see on the home page.

// Every homepage change is logged against the homepage, with the tab it was made in.
const logHomepage = (actor: Admin, area: AuditArea, label: string, change: AuditChange = 'details') =>
  logAction(actor, 'homepageUpdated', { kind: 'homepage', id: area, label }, { area, change });

const settings = () => homepageStore.get();
const saveSettings = (changes: Partial<HomepageSettings>) => homepageStore.set({ ...settings(), ...changes });

// The site's collections, which can be featured.
const collections = (): Collection[] =>
  mockCollections.map((collection) => ({ id: collection.id, title: collection.title.en, itemCount: collection.itemIds.length }));

export const fetchFeatured = () => respond(() => settings().featured);

export const fetchCollections = () => respond(collections);

export const addFeatured = (actorId: string, kind: FeaturedKind, refId: string) =>
  respond((): FeaturedSlot[] => {
    const actor = authorize(actorId, 'manageHomepage');
    const { featured } = settings();
    if (featured.some((slot) => slot.kind === kind && slot.refId === refId)) throw new AdminApiError('alreadyFeatured');
    const title = kind === 'element' ? findById(allElements(), refId).title : findById(collections(), refId).title;

    const next = [...featured, { id: newId(), kind, refId, title }];
    saveSettings({ featured: next });
    logHomepage(actor, 'featured', title, 'added');
    return next;
  });

export const removeFeatured = (actorId: string, slotId: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const { featured } = settings();
    const slot = findById(featured, slotId);
    const next = featured.filter((current) => current.id !== slotId);
    saveSettings({ featured: next });
    logHomepage(actor, 'featured', slot.title, 'removed');
    return next;
  });

export const moveFeatured = (actorId: string, slotId: string, direction: MoveDirection) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const { featured } = settings();
    const slot = findById(featured, slotId);
    const next = moveItem(featured, slotId, direction);
    saveSettings({ featured: next });
    logHomepage(actor, 'featured', slot.title, 'moved');
    return next;
  });

// Sorted by start date, so the calendar reads in order.
export const fetchOccasions = () => respond(() => [...settings().occasions].sort((a, b) => a.startDate.localeCompare(b.startDate)));

// Adds an occasion, or updates it when an id is given.
export const saveOccasion = (actorId: string, input: OccasionInput, id?: string) =>
  respond((): Occasion => {
    const actor = authorize(actorId, 'manageHomepage');
    const { occasions } = settings();
    const values = { ...input, name: trimLocalized(input.name), headline: trimLocalized(input.headline) };
    const occasion: Occasion = id ? { ...findById(occasions, id), ...values } : { id: newId(), ...values };
    saveSettings({ occasions: id ? occasions.map((current) => (current.id === id ? occasion : current)) : [...occasions, occasion] });
    logHomepage(actor, 'occasions', occasion.name.en, id ? 'details' : 'added');
    return occasion;
  });

export const deleteOccasion = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const { occasions } = settings();
    const occasion = findById(occasions, id);
    saveSettings({ occasions: occasions.filter((current) => current.id !== id) });
    logHomepage(actor, 'occasions', occasion.name.en, 'removed');
    return occasion;
  });

// The free elements chosen for a month (YYYY-MM). An empty list when none are chosen yet.
export const fetchFreeElements = (month: string) =>
  respond(() => settings().freeElements.find((entry) => entry.month === month)?.elementIds ?? []);

export const saveFreeElements = (actorId: string, month: string, elementIds: string[]) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    if (elementIds.length > maxFreeElements) throw new AdminApiError('tooManyFree');
    const elements = allElements();
    elementIds.forEach((id) => {
      if (findById(elements, id).status !== 'live') throw new AdminApiError('notLive');
    });

    saveSettings({ freeElements: [...settings().freeElements.filter((entry) => entry.month !== month), { month, elementIds }] });
    logHomepage(actor, 'freeElements', month);
    return elementIds;
  });

export const fetchBanners = () => respond(() => [...settings().banners].sort((a, b) => a.startDate.localeCompare(b.startDate)));

export const saveBanner = (actorId: string, input: BannerInput, id?: string) =>
  respond((): Banner => {
    const actor = authorize(actorId, 'manageHomepage');
    const { banners } = settings();
    const values = { ...input, text: trimLocalized(input.text), link: input.link.trim() };
    const banner: Banner = id ? { ...findById(banners, id), ...values } : { id: newId(), ...values };
    saveSettings({ banners: id ? banners.map((current) => (current.id === id ? banner : current)) : [...banners, banner] });
    logHomepage(actor, 'banners', banner.text.en, id ? 'details' : 'added');
    return banner;
  });

export const deleteBanner = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'manageHomepage');
    const { banners } = settings();
    const banner = findById(banners, id);
    saveSettings({ banners: banners.filter((current) => current.id !== id) });
    logHomepage(actor, 'banners', banner.text.en, 'removed');
    return banner;
  });
