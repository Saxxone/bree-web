<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})

async function createAccount() {}
</script>

<template>
  <div>
    <form @submit.prevent.stop="createAccount">
      <input type="text" >
    </form>
  </div>
</template>