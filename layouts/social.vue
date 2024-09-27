<script lang="ts" setup></script>

<template>
  <main class="bg-gray-100 py-6 min-h-screen">
    <div class="container pt-14 pb-24">
      <AppTopBar />

      <slot />
    </div>
    <PostsStartPost />
    <AppBottomBar class="fixed bottom-0" />
  </main>
</template>
