import type { PostMediaMetadata } from "~/types/post";
import type { MediaType } from "~/types/types";

export function mimeTypeToMediaType(
  mime: string | undefined,
): MediaType | undefined {
  if (!mime) return undefined;
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "file";
}

/** Prefer explicit `mediaTypes`; fall back to `mediaMetadata[].mimeType` from the API. */
export function resolveMediaTypes(
  media: string[],
  mediaTypes?: MediaType[],
  mediaMetadata?: (PostMediaMetadata | undefined)[],
): MediaType[] {
  return media.map((_, i) => {
    const direct = mediaTypes?.[i];
    if (direct) return direct;
    const fromMime = mimeTypeToMediaType(mediaMetadata?.[i]?.mimeType);
    if (fromMime) return fromMime;
    return "image";
  });
}
