import { resolveMediaSrc } from "~/utils/mediaUrl";

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
