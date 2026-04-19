import type { Post } from "~/types/post";
import { uploadFilesWithProgress } from "~/composables/uploadFilesWithProgress";

function collectFilesFromMediaList(media: unknown): File[] {
  if (!Array.isArray(media)) return [];
  const out: File[] = [];
  for (const m of media) {
    if (m instanceof File) out.push(m);
  }
  return out;
}

/**
 * Collects pending `File` entries from `post.media` and each long-post block in order,
 * uploads them in one request, then replaces files with returned ids (same order).
 */
export async function resolvePendingPostMedia(
  post: Partial<Post>,
  onProgress: (percent: number) => void,
): Promise<Partial<Post>> {
  const all: File[] = [];

  all.push(...collectFilesFromMediaList(post.media));

  const blocks = post.longPost?.content;
  if (blocks?.length) {
    for (const block of blocks) {
      all.push(...collectFilesFromMediaList(block.media));
    }
  }

  if (!all.length) {
    onProgress(100);
    return post;
  }

  const ids = await uploadFilesWithProgress(all, onProgress);
  if (ids.length !== all.length) {
    throw new Error("Upload response size mismatch");
  }

  const queue = [...ids];

  const mapMedia = (media: unknown): string[] | undefined => {
    if (!Array.isArray(media)) return undefined;
    return media.map((m) => {
      if (typeof m === "string") return m;
      if (m instanceof File) {
        const id = queue.shift();
        if (!id) throw new Error("Upload mapping mismatch");
        return id;
      }
      return String(m);
    });
  };

  const next: Partial<Post> = { ...post };

  const topMedia = mapMedia(post.media);
  if (topMedia) next.media = topMedia;

  if (blocks?.length) {
    next.longPost = {
      ...post.longPost,
      content: blocks.map((block) => ({
        ...block,
        media: mapMedia(block.media) ?? [],
      })),
    };
  }

  if (queue.length) throw new Error("Upload mapping mismatch");

  return next;
}
