<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { HTMLInputType } from "~/types/types";
import {
  getSignupPasswordIssue,
  signupPasswordMinLengthMet,
  signupPasswordSpecialMet,
} from "~/utils/signupPassword";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
const { page_title } = storeToRefs(globalStore);
const showText = ref(false);
const email = ref("");
const password = ref("");
function togglePasswordVisibility() {
  showText.value = !showText.value;
}

function attemptForgotPasswordSubmit() {
  const issue = getSignupPasswordIssue(password.value);
  if (issue) {
    addSnack({
      type: "error",
      message: t(`signup.validation.password_${issue}`),
    });
    return;
  }
}

onBeforeMount(() => {
  page_title.value = t("login.forgot_password");
});
</script>

<template>
  <div>
    <h1 class="text-main">{{ t("login.welcome") }}</h1>
    <AppSpacerY size="xs" />
    <form @submit.prevent.stop="attemptForgotPasswordSubmit">
      <FormsFormInput
        v-model.trim="email"
        prepend-icon="mail"
        name="email"
        :placeholder="t('login.email')"
      />

      <FormsFormInput
        id="forgot-new-password"
        v-model.trim="password"
        prepend-icon="ic:twotone-lock"
        name="password"
        described-by="forgot-password-rules"
        :append-icon="
          showText
            ? 'line-md:watch-twotone-loop'
            : 'line-md:watch-off-twotone-loop'
        "
        :input-type="showText ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('login.password')"
        @append-click="togglePasswordVisibility"
      />

      <div
        id="forgot-password-rules"
        class="text-sub -mt-2 mb-2 space-y-0.5 px-1 text-xs"
        role="status"
        aria-live="polite"
      >
        <p class="mb-1 font-medium text-main">
          {{ t("signup.validation.password_heading") }}
        </p>
        <ul class="list-none space-y-0.5">
          <li
            :class="
              signupPasswordMinLengthMet(password)
                ? 'text-green-600 dark:text-green-400'
                : 'text-rose-500/90 dark:text-rose-400/85'
            "
          >
            {{ t("signup.validation.password_rule_length") }}
          </li>
          <li
            :class="
              signupPasswordSpecialMet(password)
                ? 'text-green-600 dark:text-green-400'
                : 'text-rose-500/90 dark:text-rose-400/85'
            "
          >
            {{ t("signup.validation.password_rule_special") }}
          </li>
        </ul>
      </div>

      <button type="submit" class="btn-primary my-4 w-full">
        {{ t("login.reset_password") }}
      </button>
    </form>
  </div>
</template>
