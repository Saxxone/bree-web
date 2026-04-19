<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import { HTMLInputType } from "~/types/types";
import type { User } from "~/types/user";
import app_routes from "~/utils/routes";
import {
  getSignupPasswordIssue,
  signupPasswordMinLengthMet,
  signupPasswordSpecialMet,
} from "~/utils/signupPassword";
import {
  getSignupUsernameIssue,
  normalizeSignupUsername,
} from "~/utils/signupUsername";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const globalStore = useGlobalStore();
const { addSnack } = globalStore;
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

const isSignupFormValid = computed(() => {
  const u = user.value;
  if (!(u.name ?? "").trim()) return false;
  if (getSignupUsernameIssue(u.username) !== null) return false;
  if (!(u.email ?? "").trim()) return false;
  return getSignupPasswordIssue(u.password) === null;
});

function togglePasswordVisibility() {
  show_text.value = !show_text.value;
}

async function attemptSignup() {
  if (!isSignupFormValid.value) return;

  const usernameIssue = getSignupUsernameIssue(user.value.username);
  if (usernameIssue) {
    addSnack({
      type: "error",
      message: t(`signup.validation.username_${usernameIssue}`),
    });
    return;
  }

  const issue = getSignupPasswordIssue(user.value.password);
  if (issue) {
    addSnack({
      type: "error",
      message: t(`signup.validation.password_${issue}`),
    });
    return;
  }

  user.value.email = useToLowerCase(user.value.email as string);
  user.value.username = normalizeSignupUsername(user.value.username);
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
        id="signup-password"
        v-model.trim="user.password"
        prepend-icon="ic:twotone-lock"
        name="password"
        described-by="signup-password-rules"
        :append-icon="
          show_text
            ? 'line-md:watch-twotone-loop'
            : 'line-md:watch-off-twotone-loop'
        "
        :input-type="show_text ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('signup.password')"
        @append-click="togglePasswordVisibility"
      />

      <div
        id="signup-password-rules"
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
              signupPasswordMinLengthMet(user.password)
                ? 'text-green-600 dark:text-green-400'
                : 'text-rose-500/90 dark:text-rose-400/85'
            "
          >
            {{ t("signup.validation.password_rule_length") }}
          </li>
          <li
            :class="
              signupPasswordSpecialMet(user.password)
                ? 'text-green-600 dark:text-green-400'
                : 'text-rose-500/90 dark:text-rose-400/85'
            "
          >
            {{ t("signup.validation.password_rule_special") }}
          </li>
        </ul>
      </div>

      <button
        type="submit"
        class="btn-primary my-4 w-full"
        :disabled="!isSignupFormValid"
      >
        {{ t("signup.sign_up") }}
      </button>
    </form>

    <div
      class="text-sub flex items-center justify-center pb-3 text-center font-medium"
    >
      <span class="inline-block pr-2"> {{ t("signup.already_account") }} </span>
      <a
        :href="app_routes.login"
        class="inline-block font-semibold text-violet-500"
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
