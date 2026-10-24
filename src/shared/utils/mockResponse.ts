import { catalog } from '@/shared/constants';

// Mock backend helpers: every call settles after a short delay, like a real network request.
export const respond = <T>(value: T, delayMs: number = catalog.mockLatencyMs) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), delayMs);
  });

export const respondError = (error: Error) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => reject(error), catalog.mockLatencyMs);
  });
