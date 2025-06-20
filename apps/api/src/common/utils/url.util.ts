/**
 * Extract domain from a URL string
 * @param url - Full URL string (e.g. http://localhost:9000)
 * @returns Domain part of URL (e.g. localhost:9000)
 */
export function extractDomain(url: string | undefined): string {
  if (!url) return '';

  try {
    const urlObject = new URL(url);

    return urlObject.host;
  } catch {
    return url;
  }
}

/**
 * Combine parts to form a valid URL with trailing slash
 * @param parts - URL parts to combine
 * @returns Combined URL with trailing slash
 */
export function combineUrl(...parts: (string | undefined)[]): string {
  return (
    parts
      .filter(Boolean)
      .map(part => part?.replace(/^\/+|\/+$/g, ''))
      .filter(Boolean)
      .join('/') + '/'
  );
}
