import { useStorage } from "@vueuse/core";
import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";
import routes from "~/utils/routes";
import { useCryptoStore } from "./crypto";
import type { RouteRecordNameGeneric } from "vue-router";
// Note: crypto-store wipe is intentionally inlined below to avoid pulling the
// Olm worker into the SSR bundle path.

interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const useAuthStore = defineStore("auth", () => {
  const token_expiry = ref<number>(0);
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const access_token = useStorage("access_token", "");
  const refresh_token = useStorage("refresh_token", "");
  const is_refreshing = ref(false);
  const user = useStorage("user", {} as User, localStorage, {
    mergeDefaults: true,
  });

  const isAuthenticated = computed(() => !!access_token.value);
  const isTokenExpired = computed(() => {
    if (!token_expiry.value) return true;
    return Date.now() >= (token_expiry.value - 10) * 1000;
  });

  const setTokens = (payload: TokenPayload) => {
    access_token.value = payload.access_token;
    refresh_token.value = payload.refresh_token;
    token_expiry.value = Math.floor(Date.now() / 1000) + payload.expires_in;
  };

  function redirectToLogin() {
    const router = useRouter();
    const current = router.currentRoute.value.fullPath;
    if (current.includes(routes.login) || current.includes(routes.signup)) {
      router.push(routes.login);
      return;
    }
    router.push(
      `${routes.login}?redirect=${encodeURIComponent(current || routes.home)}`,
    );
  }

  async function signup(userData: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.register,
      FetchMethod.POST,
      userData,
    );
    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error", message: "Invalid credentials" });
      throw new Error("Invalid credentials");
    } else {
      await saveTokens(response);
      // Per-device keys are generated lazily the first time the user opens a
      // DM (via the EncryptionSetupCard). We intentionally do not create them
      // at signup anymore: the browser the user signs up in may not be the
      // one they plan to chat from.
      goTo(routes.login);
    }
  }

  async function login(loginData: Partial<User>, to: string = routes.home) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.login,
      FetchMethod.POST,
      loginData,
    );
    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error", message: "Invalid credentials" });
      logout();
    } else {
      const route = useRoute();
      saveTokens(response);
      goTo((route.query.redirect as string) || to);
    }
  }

  async function getAuthUserProfile() {
    const response = await useApiConnect<string, User>(
      `${api_routes.users.get(user.value.id)}`,
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error", message: "User not found" });
      return null;
    } else {
      user.value = response;
      return response;
    }
  }

  async function authWithGoogle(
    credential: { token: string },
    context: RouteRecordNameGeneric = "login",
    to: string = routes.home,
  ) {
    const response = await useApiConnect<{ token: string }, User>(
      context === "login" ? api_routes.google_login : api_routes.google_signup,
      FetchMethod.POST,
      credential,
    );
    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error", message: "Invalid credentials" });
      logout();
    } else {
      saveTokens(response);
      // On Google signup we used to pre-generate RSA keys here. Under the new
      // Olm protocol device keys are per-browser and are generated lazily by
      // the EncryptionSetupCard on first DM open.
      goTo(to);
    }
  }

  function goTo(to: string) {
    const router = useRouter();
    if (to.includes("/login") || to.includes("/signup"))
      router.push(routes.home);
    else router.push(to);
  }

  const clearAuth = () => {
    access_token.value = "";
    refresh_token.value = "";
    user.value = null;
    token_expiry.value = 0;
    // Legacy RSA private-key blob; remove on any logout even though new flows
    // no longer write it, so users upgrading from the old client do not leave
    // material behind on a shared browser.
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("private_key");
      } catch {
        // Accessing localStorage can throw (private mode, etc); safe to ignore.
      }
    }
  };

  async function wipeCurrentDeviceOnServer(currentDeviceId: string) {
    try {
      await useApiConnect<undefined, unknown>(
        api_routes.devices.revoke(currentDeviceId),
        FetchMethod.DELETE,
      );
    } catch {
      // Server-side revoke is best-effort on logout; a stale device will be
      // cleaned up the next time the user registers a new one on this host.
    }
  }

  async function logout() {
    const cryptoStore = useCryptoStore();
    const currentDeviceId = cryptoStore.deviceId;
    if (currentDeviceId) {
      await wipeCurrentDeviceOnServer(currentDeviceId);
    }
    try {
      await cryptoStore.wipe();
    } catch {
      // Never block the logout UX on a crypto-wipe error.
    }
    clearAuth();

    addSnack({
      message: "Sorry, you need an account to continue",
      type: "info",
      timeout: 5000,
    });
    redirectToLogin();
  }

  async function saveTokens(response: User) {
    access_token.value = response.access_token;
    refresh_token.value = response.refresh_token;
    user.value = response;
  }

  const refreshAccessToken = async (
    currentRefreshToken?: string,
  ): Promise<boolean> => {
    if (is_refreshing.value) {
      await new Promise((resolve) => {
        const checkRefreshing = () => {
          if (!is_refreshing.value) {
            resolve(true);
          } else {
            setTimeout(checkRefreshing, 100);
          }
        };
        checkRefreshing();
      });
      return !!access_token.value;
    }

    try {
      is_refreshing.value = true;
      const api_url = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${api_url}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: currentRefreshToken ?? refresh_token.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data: TokenPayload = await response.json();
      setTokens(data);
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuth();
      redirectToLogin();
      return false;
    } finally {
      is_refreshing.value = false;
    }
  };

  const initializeAuth = () => {
    try {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        const {
          access_token: stored_access_token,
          refresh_token: stored_refresh_token,
          token_expiry: stored_expiry,
          user: stored_user,
        } = JSON.parse(storedAuth);

        access_token.value = stored_access_token;
        refresh_token.value = stored_refresh_token;
        token_expiry.value = stored_expiry;
        user.value = stored_user;

        if (isTokenExpired.value) {
          void refreshAccessToken();
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearAuth();
    }
  };

  return {
    access_token,
    refresh_token,
    token_expiry,
    user,
    getAuthUserProfile,
    signup,
    login,
    logout,
    authWithGoogle,
    initializeAuth,
    isAuthenticated,
    isTokenExpired,
    refreshAccessToken,
  };
});
