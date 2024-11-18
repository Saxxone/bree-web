import { useStorage } from "@vueuse/core";
import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";

export const useAuthStore = defineStore("auth", () => {
  const is_logged_in = useStorage("is_logged_in", false);
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const access_token = useStorage("access_token", "");
  const refresh_token = useStorage("refresh_token", "");
  const user = useStorage("user", {} as User, localStorage, {
    mergeDefaults: true,
  });

  async function signup(userData: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(api_routes.register, FetchMethod.POST, userData);
    if ("status" in response) addSnack({ ...response, type: "error" });
    else {
      saveTokensAndGo(response, routes.login);
    }
  }

  async function login(loginData: Partial<User>, to: string = routes.home) {
    const response = await useApiConnect<Partial<User>, User>(api_routes.login, FetchMethod.POST, loginData);
    if ("status" in response) {
      addSnack({ ...response, type: "error" });
      logout();
    } else {
      saveTokensAndGo(response, to);
    }
  }

  async function authWithGoogle(credential: { token: string }, context: string = "login", to: string = routes.home) {
    const response = await useApiConnect(context === "login" ? api_routes.google_login : api_routes.google_signup, FetchMethod.POST, credential);
    if ("status" in response) {
      addSnack({ ...response, type: "error" });
      logout();
    } else {
      console.log(response);
      saveTokensAndGo(response, to);
    }
  }

  async function logout() {
    is_logged_in.value = false;
    user.value = null;
    access_token.value = "";
    refresh_token.value = "";

    const router = useRouter();
    router.push(routes.login);

    // const response = await useApiConnect<Partial<User>, User>(
    //   api_routes.logout,
    //   FetchMethod.POST,
    // );
    // if ("status" in response)
    //  addSnack({ ...response, type: "error" });
  }

  function saveTokensAndGo(response: User, to: string = routes.home) {
    const router = useRouter();

    access_token.value = response.access_token;
    refresh_token.value = response.refresh_token;
    is_logged_in.value = true;
    user.value = response;
    router.push(to);
  }

  return { is_logged_in, access_token, user, signup, login, logout, authWithGoogle };
});
