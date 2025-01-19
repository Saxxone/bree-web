<script setup lang="ts">
import { useAuthStore } from "~/store/auth";
import type { CredentialResponse } from "~/types/types";

defineProps<{
  context: "signin" | "signup";
}>();

const oauth_2_endpoint = import.meta.env.VITE_GOOGLE_OAUTH;
const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
const route = useRoute();

function handleCredentialResponse(response: CredentialResponse) {
  const authStore = useAuthStore();
  console.log(route.name);
  authStore.authWithGoogle({ token: response.credential }, route.name);
}
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = oauth_2_endpoint;
    script.onload = () => resolve(script);
    script.onerror = () =>
      reject(new Error("Failed to load Google API script"));
    document.head.appendChild(script);
  });
}

onMounted(async () => {
  try {
    await loadGoogleScript();

    if (typeof window.google !== "undefined") {
      window.google.accounts.id.initialize({
        client_id: client_id,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.querySelector(".g_id_signin")!,
        {
          type: "standard",
          shape: "rectangular",
          theme: "outline",
          text: "signin_with",
          size: "large",
          logo_alignment: "left",
        },
      );
    } else {
      console.error(
        "Google API script loaded but google object is not defined",
      );
    }
  } catch (error) {
    console.error("Failed to load Google API script", error);
  }
});

useHead({
  script: [
    {
      src: oauth_2_endpoint,
      async: true,
      defer: true,
    },
  ],
});
</script>

<template>
  <div>
    <div class="g_id_signin" />
  </div>
</template>
