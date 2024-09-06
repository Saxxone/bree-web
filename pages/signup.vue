<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})

async function createAccount() {}
</script>

<template>
  <div>
    <form @submit.prevent.stop="createAccount">
      <FormFormInput/>
    </form>
  </div>
</template>