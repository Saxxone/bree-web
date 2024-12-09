import { useAuthStore } from "~/store/auth";
import app_routes from "~/utils/routes";
import { useGlobalStore } from "~/store/global";

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  const { access_token } = storeToRefs(authStore);
  const publicPaths = [
    app_routes.home,
    "/post",
    app_routes.login,
    app_routes.signup,
    app_routes.forgot_password,
    app_routes.privacy,
    app_routes.tos,
  ];

  if (
    !publicPaths.some((path) => to.path.startsWith(path)) &&
    !access_token.value
  ) {
    addSnack({
      message: "Sorry, you need an account to continue",
      type: "info",
      timeout: 5000,
    });
    return navigateTo(`${app_routes.login}?redirect=${from.fullPath}`);
  }
});
