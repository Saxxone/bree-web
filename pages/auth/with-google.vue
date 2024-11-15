<script setup lang="ts">
import app_routes from "~/utils/routes";
import { useRoute, useRouter } from "vue-router";
import { ref, onBeforeMount } from "vue";

import { $fetch } from "ofetch";
import { reactive } from "vue";

interface Params {
  state: string;
  access_token: string;
  token_type: string;
  expires_in: string;
  scope: string;
  authuser: string;
  prompt: string;
  error?: string;
}

const route = useRoute();
const router = useRouter();

let uri_params = reactive<Record<string, string>>({});

function extractParams() {
  const uri_hash = route.hash;
  const params: Record<string, string> = {};

  const hashString = uri_hash.slice(1);

  const pairs = hashString.split("&");

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  }

  uri_params = { ...params };
  validateState(uri_params.access_token);
}

async function validateState(token: string) {
  const current_state = localStorage.getItem("google_auth_state");
  if (current_state && uri_params.state && current_state !== uri_params.state) {
    router.go(app_routes.login);
  } else {
    console.log(uri_params.scope.split(" "));
    validateWithGoogle(token, uri_params.scope.split(" "));
  }
}

async function validateWithGoogle(token: string, scopes: string[]) {
  const res = await $fetch(scopes[4], {
    headers: {
      Authorization: `${uri_params.token_type} ${token}`,
    },
    async onRequest({ request, options }) {
      options.query = options.query || {};

      // modify request or options
    },

    async onRequestError({ request, error }) {
      // handle error
    },

    async onResponse({ request, response }) {
      // handle response
      console.log(response);
    },

    async onResponseError({ request, response }) {
      console.log(response);
    },
  }).catch((err) => {
    console.log(err);
  });

  console.log(res);
}

async function handleErrors(error: string) {}

onBeforeMount(() => {
  extractParams();
});
</script>

<template></template>
