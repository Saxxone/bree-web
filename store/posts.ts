import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";
import { useGlobalStore } from "./global";
import { useShareApi } from "~/composables/useShareApi";


export const usePostsStore = defineStore("posts", () => {
  const globalStore = useGlobalStore();
  const feed = ref<Post[]>([]);

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
      preventDuplicatePostsInFeed(response)
        ? null
        : feed.value.push(...response);
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
      return response;
    }
  }

  async function likePost(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.like(id),
      FetchMethod.POST,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      const post = feed.value.find((post) => post.id === id);
      post?.likedBy.push();
    }
  }

  async function bookmarkPost(id: string) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.like(id),
      FetchMethod.POST,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      const post = feed.value.find((post) => post.id === id);
      post?.likedBy.push();
    }
  }

  function sharePost(post: Partial<Post>) {
    useShareApi('post.url', post.text as string);
  }

  function preventDuplicatePostsInFeed(posts: Post[]) {
    return feed.value.find((post) => post.id === posts[0].id);
  }

  return {
    feed,
    createPost,
    getFeed,
    deletePost,
    findPostById,
    likePost,
    bookmarkPost,
    sharePost
  };
});
