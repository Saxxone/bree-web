import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";

export const useAuthStore = defineStore("auth", () => {
  const is_logged_in = ref(false);
  const globalStore = useGlobalStore();
  const token = ref("");
  const refresh_token = ref("");
  const user = ref<User | null>(null);

  async function signup(userData: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.register,
      FetchMethod.POST,
      userData,
    );
    if (response.statusCode >= 300) globalStore.addSnack({...response, type: "error"});
    else {
      user.value = response.data;
      token.value = response.data.token;
      refresh_token.value = response.data.refreshToken;
      is_logged_in.value = true;
    }
  }

  async function login(loginData: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.login,
      FetchMethod.POST,
      loginData,
    );
    if (response.statusCode >= 300) globalStore.addSnack({...response, type: "error"});
    else {
      is_logged_in.value = true;
    }
  }

  async function logout() {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.logout,
      FetchMethod.POST,
    );
    if (response.statusCode >= 300) globalStore.addSnack({...response, type: "error"});
    else {
      is_logged_in.value = false;
      user.value = null;
    }
  }

  return { is_logged_in, token, user, signup, login, logout };
});
