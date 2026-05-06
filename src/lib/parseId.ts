export function parseIdFromUrl(url: string): number {
  const id = Number(url.replace(/\/$/, '').split('/').at(-1));
  if (Number.isNaN(id)) throw new Error(`Invalid pokemon URL: ${url}`);
  return id;
}
