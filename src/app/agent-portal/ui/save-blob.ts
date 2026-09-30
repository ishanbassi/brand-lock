/**
 * Hands a downloaded blob to the browser as a file.
 *
 * Agent-portal files come through authenticated API calls, so there is never a plain URL to link
 * to. The object URL is revoked on a delay rather than straight after the click: Firefox starts the
 * download asynchronously and cancels it if the URL has already gone.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A filename-safe fragment of free text, e.g. a mark name. */
export function fileSlug(value: string | null | undefined, fallback = 'export'): string {
  const slug = (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return slug ? slug.slice(0, 40) : fallback;
}
