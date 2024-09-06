<script lang="ts" setup>
async function createAccount() {}
</script>

<template>
  <div>
    <form @submit.prevent.stop="createAccount">
      <input type="text" />
    </form>
  </div>
</template>

<style></style>
