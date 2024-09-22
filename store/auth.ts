import { useStorage } from "@vueuse/core";
import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";

export const useAuthStore = defineStore("auth", () => {
  const is_logged_in = useStorage("is_logged_in", false);
  const globalStore = useGlobalStore();
  const access_token = useStorage("access_token", "");
  const refresh_token = useStorage("refresh_token", "");
  const user = useStorage<User | null>("user", null);

  async function signup(userData: Partial<User>) {
    const router = useRouter();
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.register,
      FetchMethod.POST,
      userData,
    );
    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
    else {
      saveTokensAndGoHome(response);
    }
  }

  async function login(loginData: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.login,
      FetchMethod.POST,
      loginData,
    );
    if ("statusCode" in response) {
      globalStore.addSnack({ ...response, type: "error" });
      logout();
    } else {
      saveTokensAndGoHome(response);
    }
  }

  async function logout() {
    is_logged_in.value = false;
    user.value = null;
    access_token.value = "";
    refresh_token.value = "";

    const response = await useApiConnect<Partial<User>, User>(
      api_routes.logout,
      FetchMethod.POST,
    );
    if ("statusCode" in response)
      globalStore.addSnack({ ...response, type: "error" });
  }

  function saveTokensAndGoHome(response: User) {
    const router = useRouter();

    access_token.value = response.access_token;
    refresh_token.value = response.refresh_token;
    is_logged_in.value = true;
    user.value = response;
    router.push(routes.home);
  }

  return { is_logged_in, access_token, user, signup, login, logout };
});
