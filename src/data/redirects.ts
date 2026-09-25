import { contactUrl } from './links';

export const shortLinks = {
  contact: contactUrl,
} as const;

export type ShortLinkName = keyof typeof shortLinks;
