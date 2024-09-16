import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";
import { useGlobalStore } from "./global";

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
      feed.value.push(response);
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
      feed.value = [...feed.value, ...response];
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

  return { feed, createPost, getFeed, deletePost, findPostById };
});
