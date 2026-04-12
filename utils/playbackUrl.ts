import { resolveMediaSrc } from "~/utils/mediaUrl";

/**
 * Prefer `mediaPlayback[i]` when it is non-empty after trim; otherwise use the
 * primary `media[i]` URL. Empty strings in `mediaPlayback` are treated as
 * missing so progressive file URLs in `media` are not skipped.
 */
export function pickVideoPlaybackSource(
  playback: string | null | undefined,
  primary: string,
): string {
  const p = playback?.trim() ?? "";
  if (p) return p;
  return primary;
}

export function withAccessTokenQuery(url: string, accessToken: string): string {
  if (!accessToken) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(accessToken)}`;
}

/**
 * When `requiresAuth` is false (public/CDN playback URL), leave the URL unchanged.
 * When true or unknown, append the access token like {@link withAccessTokenQuery}.
 */
export function playbackUrlWithOptionalAuth(
  url: string,
  accessToken: string,
  requiresAuth?: boolean,
): string {
  if (requiresAuth === false) return url;
  return withAccessTokenQuery(url, accessToken);
}

/** Resolve disk paths / relative API paths, then apply optional auth query. */
export function resolvePlaybackUrl(
  url: string,
  accessToken: string,
  options?: { requiresAuth?: boolean; fileId?: string },
): string {
  const resolved = resolveMediaSrc(url, { fileId: options?.fileId });
  return playbackUrlWithOptionalAuth(
    resolved,
    accessToken,
    options?.requiresAuth,
  );
}
