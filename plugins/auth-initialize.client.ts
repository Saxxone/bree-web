import { useAuthStore } from "~/store/auth";

/** Run before page components so legacy `auth` localStorage is merged into the store early (avoids feed media loading twice: once without token, once after onMounted init). */
export default defineNuxtPlugin(() => {
  useAuthStore().initializeAuth();
});
