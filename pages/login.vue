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
      <FormsFormInput prepend-icon="person" :placeholder="t('login.placeholder')" />
    </form>
  </div>
</template>
