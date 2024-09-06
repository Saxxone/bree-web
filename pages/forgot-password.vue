<script lang="ts" setup>
import { definePageMeta } from "#imports";
import { ref } from "vue";

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
        @append-click="togglePasswordVisibility"
        :append-icon="showText ? 'arrow_forward' : 'close'"
        :input-type="showText ? 'text' : 'password'"
        :placeholder="t('login.password')"
      />
    </form>
  </div>
</template>
