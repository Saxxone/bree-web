import { useStorage } from "@vueuse/core";
import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";
import routes from "~/utils/routes";
import { useCryptoStore } from "./crypto";

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
    const cryptoStore = useCryptoStore();
    const { createKeys } = cryptoStore;
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.register,
      FetchMethod.POST,
      userData,
    );
    if ("status" in response && "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      throw new Error(response.message);
    } else {
      await createKeys();
      saveTokensAndGo(response, routes.login);
    }
  }

  async function login(loginData: Partial<User>, to: string = routes.home) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.login,
      FetchMethod.POST,
      loginData,
    );
    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error", status: 200 });
      logout();
    } else {
      const route = useRoute();
      saveTokensAndGo(response, (route.query.redirect as string) || to);
    }
  }

  async function getAuthUserProfile() {
    const response = await useApiConnect<string, User>(
      `${api_routes.users.get(user.value.id)}`,
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return null;
    } else {
      user.value = response;
      return response;
    }
  }

  async function authWithGoogle(
    credential: { token: string },
    context: string = "login",
    to: string = routes.home,
  ) {
    const response = await useApiConnect(
      context === "login" ? api_routes.google_login : api_routes.google_signup,
      FetchMethod.POST,
      credential,
    );
    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      logout();
    } else {
      if (context === "signup") {
        const cryptoStore = useCryptoStore();
        const { createKeys } = cryptoStore;
        await createKeys();
      }
      saveTokensAndGo(response, to);
    }
  }

  async function logout() {
    is_logged_in.value = false;
    user.value = null;
    access_token.value = "";
    refresh_token.value = "";

    addSnack({
      message: "Sorry, you need to login to continue",
      type: "info",
      statusCode: 200,
      status: 200,
    });
    const router = useRouter();
    router.push(
      `${routes.login}?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`,
    );

    // const response = await useApiConnect<Partial<User>, User>(
    //   api_routes.logout,
    //   FetchMethod.POST,
    // );
    //  if ("status" in response || "statusCode" in response)
    //  addSnack({ ...response, type: "error" });
  }

  function saveTokensAndGo(response: User, to: string = routes.home) {
    const router = useRouter();

    access_token.value = response.access_token;
    refresh_token.value = response.refresh_token;
    is_logged_in.value = true;
    user.value = response;
    if (to.includes("/login") || to.includes("/signup"))
      router.push(routes.home);
    else router.push(to);
  }

  async function savePublicKey(id: string, key: JsonWebKey) {
    const response = await useApiConnect<Partial<User>, User>(
      `${api_routes.users.update(id)}`,
      FetchMethod.PUT,
      {
        publicKey: JSON.stringify(key as string),
      },
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...(response as Error), type: "error" });
      return null;
    } else {
      return response;
    }
  }

  return {
    is_logged_in,
    access_token,
    user,
    getAuthUserProfile,
    signup,
    login,
    logout,
    authWithGoogle,
    savePublicKey,
  };
});
