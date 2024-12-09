<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import type { User } from "~/types/user";
import { HTMLInputType } from "~/types/types";
import app_routes from "~/utils/routes";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const authStore = useAuthStore();
const { login } = authStore;
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const show_text = ref(false);
const show_google_auth = ref(false);
const user = ref<Partial<User>>({
  email: "",
  password: "",
});

function togglePasswordVisibility() {
  show_text.value = !show_text.value;
}

async function attenmptLogin() {
  user.value.email = useToLowerCase(user.value.email as string);
  await login(user.value);
}

useHead({
  title: t("login.page_title"),
});

onMounted(() => {
  page_title.value = t("login.page_title");
  show_google_auth.value = true;
});

onBeforeUnmount(() => {
  show_google_auth.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-main">{{ t("login.welcome") }}</h1>

    <AppSpacerY size="xs" />

    <form @submit.prevent.stop="attenmptLogin">
      <FormsFormInput
        id="email"
        v-model.trim="user.email"
        prepend-icon="line-md:person-twotone"
        name="email"
        :placeholder="t('login.email_username')"
        :default-value="user.email"
      />

      <FormsFormInput
        id="password"
        v-model="user.password"
        prepend-icon="ic:twotone-lock"
        name="password"
        :append-icon="
          show_text
            ? 'line-md:watch-twotone-loop'
            : 'line-md:watch-off-twotone-loop'
        "
        :input-type="show_text ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('login.password')"
        :default-value="user.password"
        @append-click="togglePasswordVisibility"
      />

      <div class="text-right flex justify-end text-sub pb-3">
        <NuxtLink :to="app_routes.forgot_password">{{
          t("login.forgot_password")
        }}</NuxtLink>
      </div>

      <button class="btn-primary w-full my-4">{{ t("login.login") }}</button>
    </form>

    <div
      class="text-sub font-medium pb-3 flex items-center justify-center text-center"
    >
      <span class="inline-block pr-2"> {{ t("login.create_account") }} </span>
      <a
        :href="app_routes.signup"
        class="font-semibold text-indigo-500 inline-block"
      >
        {{ t("login.sign_up") }}</a
      >
    </div>

    <AppSpacerY size="xs" />
    <AppPageDivider />
    <AppSpacerY size="xs" />

    <FormsAuthWithGoogle v-if="show_google_auth" context="signin" />
  </div>
</template>
