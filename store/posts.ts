import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod } from "~/types/types";
import { useGlobalStore } from "./global";

export const usePostsStore = defineStore("posts", () => {
  const globalStore = useGlobalStore();
  const posts = ref<Post[]>([]);

  async function createPost(post: Partial<Post>) {
    const response = await useApiConnect<Partial<Post>, Post>(
      api_routes.posts.create,
      FetchMethod.POST,
      post,
    );

    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      posts.value.push(response);
    }
  }

  return { posts, createPost };
});
