/* eslint-disable */
<script setup lang="ts">
/* eslint-disable */
defineProps<{
  context: "signin" | "signup";
}>();

const g_id_signin = ref(null);
</script>

<script lang="ts">
import { useAuthStore } from "~/store/auth";
import type { CredentialResponse } from "~/types/types";

const oauth_2_endpoint = import.meta.env.VITE_GOOGLE_OAUTH;
const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

useHead({
  script: [
    {
      src: oauth_2_endpoint,
      async: true,
      defer: true,
    },
  ],
});

const route = window.location.pathname.split("/")[1];

function handleCredentialResponse(response: CredentialResponse) {
  const authStore = useAuthStore();

  authStore.authWithGoogle({ token: response.credential }, route);
}

window.handleCredentialResponse = handleCredentialResponse;
</script>

<template>
  <div>
    <div
      ref="g_id_signin"
      id="g_id_onload"
      :data-client_id="client_id"
      data-callback="handleCredentialResponse"
      :data-context="context"
      data-ux_mode="popup"
      data-nonce=""
      data-auto_prompt="false"
    />

    <div
      class="g_id_signin"
      data-type="standard"
      data-shape="rectangular"
      data-theme="outline"
      :data-text="context === 'signup' ? 'signup_with' : 'signin_with'"
      data-size="large"
      data-logo_alignment="left"
    />
  </div>
</template>
