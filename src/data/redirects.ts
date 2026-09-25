export const shortLinks = {
  contact:
    'https://docs.google.com/forms/d/e/1FAIpQLSfYv8hTEEF-RUeLCQTIECUldygrhvK21UBx7l3mQHLPyE2OyQ/viewform?usp=header',
} as const;

export type ShortLinkName = keyof typeof shortLinks;