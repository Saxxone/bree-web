import type { LongPostBlock, Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { mention_pattern, url_pattern } from "~/utils/postRichText";
import { postsPaginationQuery } from "~/utils/postsPaginationQuery";
import { FetchMethod, type Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { useShareApi } from "~/composables/useShareApi";

function isNonEmptyParentId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** API: omit `parentId` unless it is a non-empty reply id (`null` / omit are both valid for root). */
function normalizeParentIdForCreate(body: Partial<Post>): void {
  if (!isNonEmptyParentId(body.parentId)) {
    delete body.parentId;
  }
}

/** API: if `mediaTypes` is sent, every entry must be a string; otherwise omit and let the API set it. */
function stripInvalidMediaTypes(record: Record<string, unknown>): void {
  const mt = record.mediaTypes;
  if (mt === undefined) return;
  if (!Array.isArray(mt) || !mt.every((x) => typeof x === "string")) {
    delete record.mediaTypes;
  }
}

function sanitizePostCreateBody(post: Partial<Post>): Partial<Post> {
  const { longPost, ...rest } = post;
  const body: Partial<Post> = { ...rest };
  normalizeParentIdForCreate(body);
  stripInvalidMediaTypes(body as Record<string, unknown>);

  if (longPost?.content?.length) {
    body.longPost = {
      ...longPost,
      content: longPost.content.map((block) => {
        const b = { ...block } as Record<string, unknown>;
        stripInvalidMediaTypes(b);
        return b as unknown as LongPostBlock;
      }),
    };
  } else if (longPost !== undefined) {
    body.longPost = longPost;
  }

  return body;
}

export const usePostsStore = defineStore("posts", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const feed = ref<Post[]>([]);

  async function createPost(
    post: Partial<Post>,
    type: "draft" | "publish",
  ): Promise<Post> {
    const payload = sanitizePostCreateBody(post);
    const response = await useApiConnect<Partial<Post>, Post>(
      type === "draft"
        ? api_routes.posts.create_draft
        : api_routes.posts.create_post,
      FetchMethod.POST,
      payload,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    }
    feed.value.unshift(response);
    return response;
  }

  async function getFeed(
    pagination: Pagination = { skip: 0, take: 10 },
  ): Promise<{ received: number } | undefined> {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.feed}?${postsPaginationQuery(pagination)}`,
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      feed.value = await mergeArraysWithoutDuplicates(
        feed.value,
        response,
        "id",
      );
      return { received: response.length };
    }
  }

  async function getUserPosts(
    userId: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getUserPosts(userId)}?${postsPaginationQuery(pagination)}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return mergeArraysWithoutDuplicates(response, currentComments, "id");
    }
  }

  async function getSearchResults(
    search: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getSearchResults(encodeURIComponent(search))}&${postsPaginationQuery(pagination)}`,
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return mergeArraysWithoutDuplicates(response, currentComments, "id");
    }
  }

  async function getComments(
    postId: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ): Promise<{ merged: Post[]; received: number }> {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getComments(postId)}?${postsPaginationQuery(pagination)}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      const received = response.length;
      const merged = await mergeArraysWithoutDuplicates(
        response,
        currentComments,
        "id",
      );
      return { merged, received };
    }
  }

  async function deletePost(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.delete(id),
      FetchMethod.DELETE,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      feed.value = feed.value.filter((post) => post.id !== id);
    }
  }

  async function findPostById(
    id: string,
    opts?: { network?: boolean },
  ): Promise<Post> {
    if (!opts?.network) {
      const fromFeed = feed.value.find((p) => p.id === id);
      if (fromFeed) {
        return fromFeed;
      }
    }

    const response = await useApiConnect<null, Post>(
      api_routes.posts.getPostById(id),
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return response;
    }
  }

  async function likePost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.like(post.id, status),
      FetchMethod.PUT,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      markLikedByMe({ ...post, ...response }, status);
    }
  }

  async function bookmarkPost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.bookmark(post.id, status),
      FetchMethod.PUT,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      markBookmarkedByMe({ ...post, ...response }, status);
    }
  }

  async function checkBookmarkedByMe(post: Post): Promise<Post> {
    let p = post;
    const response = await useApiConnect<Partial<Post>, { status: boolean }>(
      api_routes.posts.checkBookmark(post.id),
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      p = markBookmarkedByMe(post, response.status);
    }
    return p;
  }

  async function checkLikedByMe(post: Post) {
    let p = post;
    const response = await useApiConnect<Partial<Post>, { status: boolean }>(
      api_routes.posts.checkLike(post.id),
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      p = markLikedByMe(post, response.status);
    }
    return p;
  }

  function sharePost(post: Partial<Post>) {
    useShareApi("post.url", post.text as string);
  }

  function markBookmarkedByMe(post: Post, status: boolean): Post {
    const index = feed.value.findIndex((p) => post.id === p.id);
    const p = (feed.value[index] = {
      ...post,
      bookmarkedByMe: status,
    });
    return p;
  }

  function markLikedByMe(post: Post, status: boolean): Post {
    const index = feed.value.findIndex((p) => post.id === p.id);
    const p = (feed.value[index] = { ...post, likedByMe: status });
    return p;
  }

  /** Replace a post in the feed after refetch (e.g. coin unlock refreshed playback URLs). */
  function mergePostFromServer(post: Post) {
    const index = feed.value.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      feed.value[index] = post;
    }
  }

  return {
    feed,
    url_pattern,
    mention_pattern,
    createPost,
    getFeed,
    getUserPosts,
    getSearchResults,
    getComments,
    deletePost,
    findPostById,
    likePost,
    bookmarkPost,
    sharePost,
    checkLikedByMe,
    checkBookmarkedByMe,
    markBookmarkedByMe,
    markLikedByMe,
    mergePostFromServer,
  };
});
