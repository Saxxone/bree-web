<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { onClickOutside } from "@vueuse/core";
import app_routes from "~/utils/routes";

const { t } = useI18n();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

onClickOutside(root, () => {
  if (open.value) close();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="fixed inset-0 z-40 bg-black/20"
      aria-hidden="true"
      @click="close"
    />
  </Teleport>

  <div
    ref="root"
    class="absolute bottom-32 right-3 z-50 flex flex-col items-end gap-3"
  >
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-show="open"
        class="flex flex-col items-end gap-3"
        role="group"
        :aria-label="t('compose.speed_dial_actions')"
      >
        <NuxtLink
          :to="app_routes.post.compose.video"
          class="right-0 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 p-4 text-white shadow-xl"
          :aria-label="t('compose.create_video_aria')"
          @click="close"
        >
          <Icon icon="line-md:youtube-twotone" class="text-2xl" />
        </NuxtLink>
        <NuxtLink
          :to="app_routes.post.compose.post"
          class="right-0 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 p-4 text-white shadow-xl"
          :aria-label="t('compose.create_post_aria')"
          @click="close"
        >
          <Icon icon="line-md:edit-full-twotone" class="text-2xl" />
        </NuxtLink>
      </div>
    </Transition>

    <button
      type="button"
      class="right-0 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 p-4 text-white shadow-xl"
      :aria-expanded="open"
      :aria-label="
        open ? t('compose.close_menu_aria') : t('compose.open_menu_aria')
      "
      @click="toggle"
    >
      <Icon
        :icon="open ? 'line-md:close-small' : 'line-md:plus'"
        class="text-2xl transition-transform duration-150"
      />
    </button>
  </div>
</template>
