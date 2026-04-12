<script lang="ts" setup>
const show = defineModel<boolean>({ default: false });

const props = defineProps<{
  pricedCostMinor?: number | null;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const { t } = useI18n();

const costPhrase = computed(() =>
  props.pricedCostMinor != null
    ? t("posts.paid_video_interstitial_cost", {
        coins: props.pricedCostMinor,
      })
    : t("posts.paid_video_interstitial_cost_unknown"),
);

function onBackdrop() {
  show.value = false;
}

function onConfirm() {
  emit("confirm");
  show.value = false;
}

watch(show, (open) => {
  if (!import.meta.client) return;
  document.body.classList.toggle("overflow-hidden", !!open);
});

function onKeydown(e: KeyboardEvent) {
  if (!show.value || e.key !== "Escape") return;
  onBackdrop();
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("overflow-hidden");
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('posts.paid_video_interstitial_title')"
      @click.self="onBackdrop"
    >
      <div class="bg-base-white max-w-md rounded-xl p-6 shadow-lg" @click.stop>
        <div class="mb-4 flex items-center gap-2">
          <IconsLineCoins
            :size="28"
            class="text-main shrink-0"
            aria-hidden="true"
          />
          <h2 class="text-main text-lg font-semibold leading-snug">
            {{ t("posts.paid_video_interstitial_title") }}
          </h2>
        </div>
        <p class="text-sub mb-3 text-sm leading-relaxed">
          {{ costPhrase }}
        </p>
        <p class="text-muted mb-6 text-sm leading-relaxed">
          {{ t("posts.paid_video_interstitial_availability") }}
        </p>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="text-muted hover:text-main rounded-lg px-4 py-2 text-sm font-medium"
            @click="onBackdrop"
          >
            {{ t("posts.paid_video_interstitial_cancel") }}
          </button>
          <button
            type="button"
            class="bg-purple-600 hover:bg-purple-700 rounded-lg px-4 py-2 text-sm font-medium text-white"
            @click="onConfirm"
          >
            {{ t("posts.paid_video_interstitial_continue") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
