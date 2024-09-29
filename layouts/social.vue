<script lang="ts" setup></script>

<template>
  <main class="bg-gray-100 py-6 lg:py-0 min-min-h-screen">
    <div class="container pt-14 pb-24 lg:py-0">
      <AppTopBar class="lg:hidden" />

      <div class="lg:grid grid-cols-12 gap-4">
        <section class="col-span-3">
          <AppLeftSideBar />
        </section>
        <section class="col-span-6 relative">
          <slot />
          <PostsStartPost />
        </section>
        <section class="col-span-3">
          <AppRightSideBar />
        </section>
      </div>
    </div>

    <AppBottomBar class="fixed bottom-0 lg:hidden" />
  </main>
</template>
