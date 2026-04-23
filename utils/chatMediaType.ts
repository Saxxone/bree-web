import type { MediaType } from "~/types/types";

/**
 * Prisma stores `Chat.mediaType` as `String[]` (see afovid-api `ChatService.create`),
 * but the UI components expect a single `MediaType` string.
 */
export function normalizeChatMediaType(
  raw: string | string[] | undefined | null,
): MediaType | undefined {
  if (raw == null) return undefined;
  const one = Array.isArray(raw) ? raw[0] : raw;
  if (!one) return undefined;
  if (
    one === "image" ||
    one === "video" ||
    one === "audio" ||
    one === "file" ||
    one === "link"
  )
    return one;
  return undefined;
}
