<script lang="ts" setup>
import { useGlobalStore } from "~/store/global";
import { HTMLInputType } from "~/types/types";

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

onBeforeMount(() => {
  page_title.value = t("login.forgot_password");
});
</script>

<template>
  <div>
    <h1 class="text-main">{{ t("login.welcome") }}</h1>
    <AppSpacerY size="xs" />
    <form>
      <FormsFormInput
        prepend-icon="mail"
        name="email"
        :placeholder="t('login.email')"
      />

      <FormsFormInput
        prepend-icon="ic:twotone-lock"
        name="password"
        :append-icon="
          showText
            ? 'line-md:watch-twotone-loop'
            : 'line-md:watch-off-twotone-loop'
        "
        :input-type="showText ? HTMLInputType.Text : HTMLInputType.Password"
        :placeholder="t('login.password')"
        @append-click="togglePasswordVisibility"
      />
    </form>
  </div>
</template>
