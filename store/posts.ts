import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod, type Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { useShareApi } from "~/composables/useShareApi";

export const usePostsStore = defineStore("posts", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const feed = ref<Post[]>([]);

  async function createPost(post: Partial<Post>, type: "draft" | "publish") {
    const response = await useApiConnect<Partial<Post>, Post>(
      type === "draft"
        ? api_routes.posts.create_draft
        : api_routes.posts.create_post,
      FetchMethod.POST,
      post,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      feed.value.unshift(response);
    }
  }

  async function getFeed(
    pagination: Pagination = { cursor: feed.value?.[0].id, skip: 0, take: 10 },
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.feed}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.POST,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      feed.value = await preventDuplicatePosts(response, feed.value);
    }
  }

  async function getUserPosts(
    userId: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getUserPosts(userId)}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET,
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return [];
    } else {
      return preventDuplicatePosts(response, currentComments);
    }
  }

  async function getSearchResults(
    search: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getSearchResults(encodeURIComponent(search))}&cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.POST,
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return [];
    } else {
      return preventDuplicatePosts(response, currentComments);
    }
  }

  async function getComments(
    postId: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    currentComments: Post[] = [],
  ) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.posts.getComments(postId)}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET,
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return [];
    } else {
      return preventDuplicatePosts(response, currentComments);
    }
  }

  async function deletePost(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.delete(id),
      FetchMethod.DELETE,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      feed.value = feed.value.filter((post) => post.id !== id);
    }
  }

  async function findPostById(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.getPostById(id),
      FetchMethod.GET,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await processPost(response);
    }
  }

  async function likePost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.like(post.id, status),
      FetchMethod.PUT,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      markLikedByMe({ ...post, ...response }, status);
    }
  }

  async function bookmarkPost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.bookmark(post.id, status),
      FetchMethod.PUT,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      markBookmarkedByMe({ ...post, ...response }, status);
    }
  }

  async function checkBookmarkedByMe(post: Post): Promise<Post> {
    let p = post;
    const response = await useApiConnect<Partial<Post>, { status: boolean }>(
      api_routes.posts.checkBookmark(post.id),
      FetchMethod.POST,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
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

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      p = markLikedByMe(post, response.status);
    }
    return p;
  }

  function sharePost(post: Partial<Post>) {
    useShareApi("post.url", post.text as string);
  }

  async function preventDuplicatePosts(posts: Post[], feed: Post[] = []) {
    const processedPosts = await Promise.all(posts.map(processPost));
    feed = feed.filter((post) => !processedPosts.some((p) => p.id === post.id));
    feed.unshift(...processedPosts);
    return feed;
  }

  async function processPost(post: Post) {
    return await checkLikedByMe(await checkBookmarkedByMe(post));
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

  return {
    feed,
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
  };
});
