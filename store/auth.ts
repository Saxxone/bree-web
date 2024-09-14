import { FetchMethod } from "~/types/types";
import type { User } from "~/types/user";
import api_routes from "~/utils/api_routes";
import { useGlobalStore } from "./global";

export const useAuthStore = defineStore("auth", () => {
  const isLoggedIn = ref(false);
  const globalStore = useGlobalStore();
  const token = ref("");
  const user = ref<User | null>(null);

  async function signup(user: Partial<User>) {
    const response = await useApiConnect<Partial<User>, User>(
      api_routes.register,
      FetchMethod.POST,
      user,
    );
    console.log(response);
    if (response.statusCode >= 300) globalStore.addSnack({...response, type: "error"});
  }

  async function login(userData: User) {
    isLoggedIn.value = true;
    user.value = userData;
    // Here you would typically handle token storage, e.g. using localStorage
  }

  function logout() {
    isLoggedIn.value = false;
    user.value = null;
    // Clear any stored tokens
  }

  return { isLoggedIn, token, user, signup, login, logout };
});
