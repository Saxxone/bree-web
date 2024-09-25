import { usePostsStore } from "~/store/posts";
import type { Post } from "~/types/post";
import app_routes from "~/utils/routes";

export function goToPost(
  post: Post,
  args: {
    replace?: boolean;
    query?: Record<string, any>;
    params?: Record<string, any>;
  } = {
    replace: false,
    query: {},
    params: {},
  },
) {
  const router = useRouter();
  router.push({
    path: app_routes.post.view(post.id),
    ...(args.query && { query: args.query }),
    ...(args.params && { params: args.params }),
    ...(args.replace && { replace: args.replace }),
  });
}
