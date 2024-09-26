import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  if (!authStore.is_logged_in) {
    return navigateTo(app_routes.login);
  }

  if(!authStore.access_token) {
    return navigateTo(app_routes.login);
  }
});
