import api_routes from "~/utils/api_routes";

function apiBase(): string {
  return String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

/** True when the API mistakenly returns a server disk path instead of an HTTP URL. */
export function isProbablyFilesystemPath(value: string): boolean {
  const s = value.trim();
  if (!s) return false;
  if (
    /^https?:\/\//i.test(s) ||
    s.startsWith("blob:") ||
    s.startsWith("data:")
  ) {
    return false;
  }
  if (/^\/Volumes\//.test(s)) return true;
  if (/^\/Users\//.test(s)) return true;
  if (/^\/home\//.test(s)) return true;
  if (/^[A-Za-z]:[\\/]/.test(s)) return true;
  return false;
}

/**
 * Turn API media references into URLs the browser can load.
 * - Absolute disk paths → `{VITE_API_BASE_URL}/file/{fileId}` (see api_routes.files.get)
 * - Paths starting with `/api/...` (e.g. stream URLs) → prefixed with API base
 * - Paths starting with `/file/...` → prefixed with API base
 * - Already absolute http(s) URLs → unchanged
 */
export function resolveMediaSrc(
  url: string,
  options?: { fileId?: string },
): string {
  if (!url) return url;
  const s = url.trim();
  if (!s) return s;

  if (
    /^https?:\/\//i.test(s) ||
    s.startsWith("blob:") ||
    s.startsWith("data:")
  ) {
    return s;
  }

  const base = apiBase();
  if (!base) return s;

  if (isProbablyFilesystemPath(s)) {
    const id =
      options?.fileId?.trim() || s.split(/[/\\]/).filter(Boolean).pop();
    if (id) {
      return `${base}${api_routes.files.get(id)}`;
    }
    return s;
  }

  // API-relative URLs (playback often returns `/api/file/stream/...`); must not use the Nuxt origin.
  if (s.startsWith("/api/")) {
    const baseNorm = base.replace(/\/$/, "");
    const path = /\/api$/i.test(baseNorm) ? s.replace(/^\/api(?=\/)/, "") : s;
    return `${baseNorm}${path}`;
  }

  // API-relative media URLs (same host as VITE_API_BASE_URL), not Nuxt public assets.
  if (s.startsWith("/file/")) {
    return `${base}${s}`;
  }

  return s;
}
