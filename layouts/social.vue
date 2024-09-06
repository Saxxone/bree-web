<script lang="ts" setup></script>

<template>
  <main class="bg-gray-100 py-6 min-h-screen">
    <div class="container pb-24">
      <AppTopBar />

      <slot />
    </div>

    <AppBottomBar class="fixed bottom-0" />
  </main>
</template>
