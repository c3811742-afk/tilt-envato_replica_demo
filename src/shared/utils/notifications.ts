import { downloadPreparingSeconds, releaseNotes } from '@/shared/constants';
import type { Download, User } from '@/shared/types';

// Release notes the user hasn't seen yet (all of them before the first visit to "What's new").
export const unreadReleaseNotes = (user: User) =>
  releaseNotes.filter((note) => !user.releasesSeenAt || new Date(note.date) > new Date(user.releasesSeenAt));

// A download is "preparing" for a moment after it's requested, then "ready" (the demo's stand-in for a real queue).
export const downloadStatus = (download: Download, now: number = Date.now()) =>
  now - new Date(download.requestedAt).getTime() < downloadPreparingSeconds * 1000 ? 'preparing' : 'ready';

// What the bell counts: unread release notes plus unread account notifications.
export const unreadCount = (user: User) => unreadReleaseNotes(user).length + user.alerts.filter((alert) => !alert.read).length;
