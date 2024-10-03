import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  const { is_logged_in, access_token } = storeToRefs(authStore);

  if (!is_logged_in.value) {
    return navigateTo(app_routes.login);
  }

  if (!access_token.value) {
    return navigateTo(app_routes.login);
  }
});
