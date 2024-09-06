<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})

const { t } = useI18n();
async function login() {}
</script>

<template>
  <div>
    <h1>{{ t('login.welcome') }}</h1>
    <form @submit.prevent.stop="login">
      <FormsFormInput prepend-icon="mail" :placeholder="t('login.email')" />
      <FormsFormInput prepend-icon="lock" :placeholder="t('login.password')" />
    </form>
  </div>
</template>
