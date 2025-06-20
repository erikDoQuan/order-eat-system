import slugify from 'slugify';

export function getShortName(name = 'A'): string {
  const words = name.split(' ').slice(0, 2);
  const initials = words.map(word => word[0]?.toUpperCase()).join('');

  return initials;
}

export function convertBytes(byte: number): string {
  const kiloByte: number = byte / 1024;
  const megaByte: number = kiloByte / 1024;
  const gigaByte: number = megaByte / 1024;

  if (gigaByte >= 1) {
    return `${gigaByte.toFixed(2)} GB`;
  } else if (megaByte >= 1) {
    return `${megaByte.toFixed(2)} MB`;
  } else if (kiloByte >= 1) {
    return `${kiloByte.toFixed(2)} KB`;
  } else {
    return `${byte} bytes`;
  }
}

export const toSlug = (text: string): string => {
  return slugify(text.toLowerCase(), {
    lower: true,
    remove: /[:;.,*+~!@#^&?(){}"'/[\]]/g,
  });
};

export function repeatStr(firstChar: string, char: string, length: number): string {
  if (length === 0) return '';

  return firstChar + char.repeat(length);
}

export function toCapitalized(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const stripHTML = (htmlString: string) => {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, '');
};

export function objectToQueryString(obj: Record<string, unknown>): string {
  return Object.keys(obj)
    .filter(key => {
      const value = obj[key];
      // Filter out null, undefined, empty strings, empty arrays, and empty objects
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && Object.keys(value).length === 0) return false;
      return true;
    })
    .map(key => {
      const value = obj[key] as string;
      if (Array.isArray(value)) {
        return value.map((item: string, index: number) => `${encodeURIComponent(key)}[${index}]=${encodeURIComponent(item)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
}

export function isJson(text: string) {
  try {
    JSON.parse(text);
  } catch (e) {
    return false;
  }
  return true;
}
