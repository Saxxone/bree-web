<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
const progress = defineModel<number>("progress", { default: 0 });

const { t } = useI18n();

watch(open, (v) => {
  if (!import.meta.client) return;
  document.body.classList.toggle("overflow-hidden", !!v);
});

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === "Escape") e.preventDefault();
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown, { capture: true });
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown, { capture: true });
    document.body.classList.remove("overflow-hidden");
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('posts.media_upload_modal_title')"
    >
      <div
        class="bg-base-white w-full max-w-sm rounded-xl p-6 shadow-lg"
        @click.stop
      >
        <h2 class="text-main mb-1 text-lg font-semibold">
          {{ t("posts.media_upload_modal_title") }}
        </h2>
        <p class="text-sub mb-4 text-sm leading-snug">
          {{ t("posts.media_upload_modal_hint") }}
        </p>
        <div
          class="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="h-full rounded-full bg-violet-500 transition-[width] duration-150 ease-out"
            :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
          />
        </div>
        <p class="text-main text-right text-xs font-medium tabular-nums">
          {{ Math.min(100, Math.max(0, progress)) }}%
        </p>
      </div>
    </div>
  </Teleport>
</template>
