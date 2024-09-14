import type { User } from '~/types/user';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const user = ref<User | null>(null);

  function login(userData: User) {
    isLoggedIn.value = true;
    user.value = userData;
    // Here you would typically handle token storage, e.g. using localStorage
  }

  function logout() {
    isLoggedIn.value = false;
    user.value = null;
    // Clear any stored tokens
  }

  return { isLoggedIn, user, login, logout };
});
