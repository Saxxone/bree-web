<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import { HTMLInputType } from "~/types/types";
import type { User } from "~/types/user";
import app_routes from "~/utils/routes";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const authStore = useAuthStore();
const { signup } = authStore;
const showText = ref(false);
const user = ref<Partial<User>>({
  name: "",
  username: "",
  email: "",
  password: "",
});

function togglePasswordVisibility() {
  showText.value = !showText.value;
}

async function attemptSignup() {
  user.value.email = useToLowerCase(user.value.email as string);
  user.value.username = useToLowerCase(user.value.username as string);
  await signup(user.value);
}

onBeforeMount(() => {
  page_title.value = t("signup.page_title");
});
</script>

<template>
  <div>
    <h1>{{ t("signup.welcome") }}</h1>

    <AppSpacerY size="xs" />

    <form @submit.prevent.stop="attemptSignup">
      <FormsFormInput v-model.trim="user.name" prepend-icon="person" name="full name" :placeholder="t('signup.full_name')" />

      <FormsFormInput v-model.trim="user.username" prepend-icon="alternate_email" name="username" :placeholder="'@' + t('signup.username')" />

      <FormsFormInput v-model.trim="user.email" prepend-icon="mail" name="email" :placeholder="t('signup.email')" />

      <FormsFormInput
        v-model.trim="user.password"
        prepend-icon="lock"
        name="password"
        :append-icon="showText ? 'visibility' : 'visibility_off'"
        :input-type="showText ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('signup.password')"
        @append-click="togglePasswordVisibility" />

      <button class="btn-primary w-full my-4">{{ t("signup.sign_up") }}</button>
    </form>

    <div class="text-sub font-medium pb-3 flex items-center justify-center text-center">
      <span class="inline-block pr-2"> {{ t("signup.already_account") }} </span>
      <NuxtLink :to="app_routes.login" class="font-semibold text-gray-800 inline-block"> {{ t("signup.sign_in") }}?</NuxtLink>
    </div>

    <AppSpacerY size="xs" />
    <AppPageDivider />
    <AppSpacerY size="xs" />
  </div>
</template>
