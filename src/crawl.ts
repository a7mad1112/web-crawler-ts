export function normalizeURL(url: string): string {
  const urlObj = new URL(url);

  const host = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname.endsWith("/")
    ? urlObj.pathname.slice(0, -1)
    : urlObj.pathname;

  return `${host}${pathname}${urlObj.search}`;
}
