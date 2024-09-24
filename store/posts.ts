import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";
import { useGlobalStore } from "./global";
import { useShareApi } from "~/composables/useShareApi";

export const usePostsStore = defineStore("posts", () => {
  const globalStore = useGlobalStore();
  const feed = ref<Post[]>([]);
  const current_post = ref<Post | null>(null);

  async function createPost(post: Partial<Post>, type: "draft" | "publish") {
    const response = await useApiConnect<Partial<Post>, Post>(
      type === "draft"
        ? api_routes.posts.create_draft
        : api_routes.posts.create_post,
      FetchMethod.POST,
      post,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      feed.value.unshift(response);
    }
  }

  async function getFeed() {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      api_routes.posts.feed,
      FetchMethod.POST,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      preventDuplicatePostsInFeed(response);
    }
  }

  async function getComments(postId: string) {
    const response = await useApiConnect<Partial<Post>, Post[]>(
      api_routes.posts.getComments(postId),
      FetchMethod.GET,
    );

    if ("statusCode" in response) {
      globalStore.addSnack({ ...response, type: "error" });
      return [];
    } else {
      return response;
    }
  }

  async function deletePost(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.delete(id),
      FetchMethod.DELETE,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      feed.value = feed.value.filter((post) => post.id !== id);
    }
  }

  async function findPostById(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.getPostById(id),
      FetchMethod.GET,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      return (current_post.value = await processPost(response));
    }
  }

  async function likePost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.like(post.id, status),
      FetchMethod.PUT,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      markLikedByMe({ ...post, ...response }, status);
    }
  }

  async function bookmarkPost(post: Post, status: boolean) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.bookmark(post.id, status),
      FetchMethod.PUT,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
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

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
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

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      p = markLikedByMe(post, response.status);
    }
    return p;
  }

  function sharePost(post: Partial<Post>) {
    useShareApi("post.url", post.text as string);
  }

  async function preventDuplicatePostsInFeed(posts: Post[]) {
    const processedPosts = await Promise.all(posts.map(processPost));
    feed.value = [...processedPosts];
  }

  async function processPost(post: Post) {
    return await checkLikedByMe(await checkBookmarkedByMe(post));
  }

  function markBookmarkedByMe(post: Post, status: boolean): Post {
    const index = feed.value.findIndex((p) => post.id === p.id);
    current_post.value = feed.value[index] = {
      ...post,
      bookmarkedByMe: status,
    };
    return current_post.value;
  }

  function markLikedByMe(post: Post, status: boolean): Post {
    const index = feed.value.findIndex((p) => post.id === p.id);
    current_post.value = feed.value[index] = { ...post, likedByMe: status };
    return current_post.value;
  }

  return {
    current_post,
    feed,
    createPost,
    getFeed,
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
