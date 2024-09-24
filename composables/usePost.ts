import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

export function goToPost(post: Post, query: Record<string, any> = {}, params: Record<string, any> = {}) {
  const postStore = usePostsStore();
  const router = useRouter();
  
  postStore.current_post = post;
  router.push({
      path: app_routes.post.view(post.id), 
      query,
      params,
  });
}