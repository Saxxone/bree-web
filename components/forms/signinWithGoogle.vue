<script setup lang="ts">
interface Props {
  token: string;
}
const props = defineProps<Props>();

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URI;
const oauth_2_endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
const response_type = "token";
const scopes = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
const include_granted_scopes = "true";
</script>

<template>
  <form ref="google_auth_form" :action="oauth_2_endpoint" method="GET" rel="noopener">
    <input type="hidden" name="client_id" :value="client_id" />
    <input type="hidden" name="redirect_uri" :value="redirect_uri" />
    <input type="hidden" name="response_type" :value="response_type" />
    <input type="hidden" name="scope" :value="scopes" />
    <input type="hidden" name="include_granted_scopes" :value="include_granted_scopes" />
    <input type="hidden" name="state" :value="token" />
    <button type="submit" class="p-3 bg-base-white inline-block">Sign in with Google</button>
  </form>
</template>
