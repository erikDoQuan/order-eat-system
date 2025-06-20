import slugify from 'slugify';

export const toSlug = (text: string): string => {
  return slugify(text.toLowerCase(), {
    lower: true,
    remove: /[:;.,*+~!@#^&?(){}"'/[\]]/g,
  });
};

export const normalizeWhitespace = (str?: string): string => {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
};
