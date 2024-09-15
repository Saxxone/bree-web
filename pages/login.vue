<script lang="ts" setup>
import { definePageMeta } from "#imports";
import { ref } from "vue";
import { useAuthStore } from "~/store/auth";
import type { User } from "~/types/user";
import { HTMLInputType } from "~/types/types";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const authStore = useAuthStore();
const showText = ref(false);
const router = useRouter();
const user = ref<Partial<User>>({
  email: "",
  password: "",
});

function togglePasswordVisibility() {
  showText.value = !showText.value;
}

async function login() {
  await authStore.login(user.value);
}
</script>

<template>
  <div>
    <h1>{{ t("login.welcome") }}</h1>

    <AppSpacerY size="xs" />

    <form @submit.prevent.stop="login">
      <FormsFormInput
        prepend-icon="mail"
        name="email"
        v-model="user.email"
        :placeholder="t('login.email')"
      />

      <FormsFormInput
        prepend-icon="lock"
        v-model="user.password"
        name="password"
        @append-click="togglePasswordVisibility"
        :append-icon="showText ? 'visibility' : 'visibility_off'"
        :input-type="showText ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('login.password')"
      />

      <div class="text-right flex justify-end text-gray-500 pb-3">
        <NuxtLink :to="app_routes.forgot_password">{{
          t("login.forgot_password")
        }}</NuxtLink>
      </div>

      <button class="btn-primary w-full my-4">{{ t("login.login") }}</button>
    </form>

    <div
      class="text-gray-400 font-medium pb-3 flex items-center justify-center text-center"
    >
      <span class="inline-block pr-2"> {{ t("login.create_account") }} </span>
      <NuxtLink
        :to="app_routes.signup"
        class="font-semibold text-gray-800 inline-block"
      >
        {{ t("login.sign_up") }}</NuxtLink
      >
    </div>

    <AppSpacerY size="xs" />
    <AppPageDivider />
    <AppSpacerY size="xs" />
  </div>
</template>
