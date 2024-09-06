<script lang="ts" setup>
import { definePageMeta } from "#imports";
import { ref } from "vue";
import app_routes from "~/utils/routes";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const showText = ref(false);

function togglePasswordVisibility() {
  showText.value = !showText.value;
}
async function login() {}
</script>

<template>
  <div>
    <h1>{{ t("signup.welcome") }}</h1>

    <AppSpacerY size="xs" />

    <form @submit.prevent.stop="login">
      <FormsFormInput
        prepend-icon="person"
        name="full name"
        :placeholder="t('signup.full_name')"
      />
      <FormsFormInput
        prepend-icon="mail"
        name="email"
        :placeholder="t('signup.email')"
      />
      <FormsFormInput
        prepend-icon="lock"
        name="password"
        @append-click="togglePasswordVisibility"
        :append-icon="showText ? 'arrow_forward' : 'close'"
        :input-type="showText ? 'text' : 'password'"
        :placeholder="t('signup.password')"
      />

      <button class="btn-primary my-4">{{ t("signup.sign_up") }}</button>
    </form>

    <div
      class="text-gray-400 font-medium pb-3 flex items-center justify-center text-center"
    >
      <span class="inline-block pr-2"> {{ t("signup.already_account") }} </span>
      <NuxtLink
        :to="app_routes.forgot_password"
        class="font-semibold text-gray-800 inline-block"
      >
        {{ t("signup.sign_in") }}?</NuxtLink
      >
    </div>

    <AppSpacerY size="xs" />
    <AppPageDivider />
    <AppSpacerY size="xs" />
  </div>
</template>
