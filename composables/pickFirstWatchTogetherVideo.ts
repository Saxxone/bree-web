import type { Post } from "~/types/post";
import {
  pickVideoPlaybackSource,
  resolvePlaybackUrl,
} from "~/utils/playbackUrl";

export type WatchTogetherVideoPick = {
  url: string;
};

/**
 * First video asset on a post (SHORT or LONG), with auth-aware playback URL.
 */
export function pickFirstWatchTogetherVideo(
  post: Post,
  accessToken: string,
): WatchTogetherVideoPick | null {
  if (post.type === "LONG" && post.longPost?.content?.length) {
    for (const block of post.longPost.content) {
      const types = block.mediaTypes ?? [];
      const idx = types.indexOf("video");
      if (idx < 0) continue;
      const raw = pickVideoPlaybackSource(
        block.mediaPlayback?.[idx],
        block.media[idx] as string,
      );
      const meta = block.mediaMetadata?.[idx];
      return {
        url: resolvePlaybackUrl(raw, accessToken, {
          requiresAuth: meta?.requiresAuth,
          fileId: meta?.fileId,
        }),
      };
    }
    return null;
  }

  const types = post.mediaTypes ?? [];
  const idx = types.indexOf("video");
  if (idx < 0) return null;
  const raw = pickVideoPlaybackSource(
    post.mediaPlayback?.[idx],
    post.media[idx] as string,
  );
  const meta = post.mediaMetadata?.[idx];
  return {
    url: resolvePlaybackUrl(raw, accessToken, {
      requiresAuth: meta?.requiresAuth,
      fileId: meta?.fileId,
    }),
  };
}
