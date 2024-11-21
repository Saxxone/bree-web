import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  const { access_token } = storeToRefs(authStore);
  const publicPaths = [
    "/",
    app_routes.home,
    app_routes.login,
    app_routes.signup,
    app_routes.forgot_password,
  ];

  if (!publicPaths.includes(to.path) && !access_token.value) {
    return navigateTo(app_routes.login);
  }
});
