import type {
  LocationQueryRaw,
  RouteLocationAsRelativeGeneric,
} from "vue-router";
import app_routes from "~/utils/routes";
import { useGlobalStore } from "~/store/global";

export function goToPost(
  post: string,
  args?: {
    replace?: boolean;
    query?: LocationQueryRaw;
    params?: RouteLocationAsRelativeGeneric;
  },
) {
  const router = useRouter();
  router.push({
    path: app_routes.post.view(post),
    ...(args?.query && { query: args?.query }),
    ...(args?.params && { params: args?.params }),
    ...(args?.replace && { replace: args?.replace }),
  });
}

export function goToProfile(id: string) {
  const router = useRouter();
  router.push({
    path: app_routes.profile.view(id),
  });
}

export async function useUploadMedia(media: File[]): Promise<string[]> {
  const globalStore = useGlobalStore();
  const { uploadFiles } = globalStore;
  const mediaUrls = await uploadFiles(media);
  return mediaUrls;
}
