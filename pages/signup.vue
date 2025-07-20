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
const show_text = ref(false);
const show_google_auth = ref(false);
const user = ref<Partial<User>>({
  name: "",
  username: "",
  email: "",
  password: "",
});

function togglePasswordVisibility() {
  show_text.value = !show_text.value;
}

async function attemptSignup() {
  user.value.email = useToLowerCase(user.value.email as string);
  user.value.username = useToLowerCase(user.value.username as string);
  await signup(user.value);
}

onBeforeMount(() => {
  page_title.value = t("signup.page_title");
  show_google_auth.value = true;
});

onBeforeUnmount(() => {
  show_google_auth.value = false;
});
</script>

<template>
  <div>
    <h1 class="text-main">{{ t("signup.welcome") }}</h1>

    <AppSpacerY size="xs" />

    <form @submit.prevent.stop="attemptSignup">
      <FormsFormInput
        v-model.trim="user.name"
        prepend-icon="line-md:person-twotone"
        name="full name"
        :placeholder="t('signup.full_name')"
      />

      <FormsFormInput
        v-model.trim="user.username"
        prepend-icon="material-symbols:alternate-email-rounded"
        name="username"
        :placeholder="'@' + t('signup.username')"
      />

      <FormsFormInput
        v-model.trim="user.email"
        prepend-icon="line-md:email-twotone"
        name="email"
        :placeholder="t('signup.email')"
      />

      <FormsFormInput
        v-model.trim="user.password"
        prepend-icon="ic:twotone-lock"
        name="password"
        :append-icon="
          show_text
            ? 'line-md:watch-twotone-loop'
            : 'line-md:watch-off-twotone-loop'
        "
        :input-type="show_text ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('signup.password')"
        @append-click="togglePasswordVisibility"
      />

      <button class="btn-primary my-4 w-full">{{ t("signup.sign_up") }}</button>
    </form>

    <div
      class="text-sub flex items-center justify-center pb-3 text-center font-medium"
    >
      <span class="inline-block pr-2"> {{ t("signup.already_account") }} </span>
      <a
        :href="app_routes.login"
        class="inline-block font-semibold text-indigo-500"
      >
        {{ t("signup.sign_in") }}?</a
      >
    </div>

    <AppSpacerY size="xs" />
    <AppPageDivider />
    <AppSpacerY size="xs" />

    <FormsAuthWithGoogle context="signup" />
  </div>
</template>
