<script setup lang="ts">
const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI;
const oauth_2_endpoint = "https://accounts.google.com/gsi/client";

useHead({
  script: [
    {
      src: oauth_2_endpoint,
      async: true,
      defer: true,
    },
  ],
});

async function handleCredentialResponse() {
  //
}
</script>

<template>
  <div>
    <div
      id="g_id_onload"
      :data-client_id="client_id"
      data-callback="(e) => {
      console.log(e);
      }"
      data-context="signin"
      data-ux_mode="popup"
      data-nonce=""
      data-auto_prompt="false"></div>

    <div class="g_id_signin" data-type="standard" data-shape="rectangular" data-theme="outline" data-text="signin_with" data-size="large" data-logo_alignment="left"></div>
  </div>
</template>
