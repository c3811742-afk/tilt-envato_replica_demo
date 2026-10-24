import type { ThreadProps } from './MessageThread.types';

export const messageThreadDefaults: Required<Pick<ThreadProps, 'messages' | 'framed'>> = {
  messages: [],
  framed: true,
};
