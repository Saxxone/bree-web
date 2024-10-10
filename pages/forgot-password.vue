<script lang="ts" setup>
import { HTMLInputType } from "~/types/types";
import { useGlobalStore } from "~/store/global";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { page_title } = storeToRefs(globalStore);
const showText = ref(false);

function togglePasswordVisibility() {
  showText.value = !showText.value;
}

async function login() {}

onBeforeMount(() => {
  page_title.value = t("login.forgot_password");
});
</script>

<template>
  <div>
    <h1>{{ t("login.welcome") }}</h1>
    <AppSpacerY size="xs" />
    <form @submit.prevent.stop="login">
      <FormsFormInput
        prepend-icon="mail"
        name="email"
        :placeholder="t('login.email')"
      />

      <FormsFormInput
        prepend-icon="lock"
        name="password"
        :append-icon="showText ? 'visibility' : 'visibility_off'"
        :input-type="showText ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('login.password')"
        @append-click="togglePasswordVisibility"
      />
    </form>
  </div>
</template>
