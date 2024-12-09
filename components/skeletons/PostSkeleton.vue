<script lang="ts" setup>
const widths = ref(["w-40", "w-52", "w-full"]);

const random_widths = computed(() => {
  const shuffledWidths = [...widths.value];

  for (let i = shuffledWidths.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWidths[i], shuffledWidths[j]] = [
      shuffledWidths[j],
      shuffledWidths[i],
    ];
  }
  return shuffledWidths.slice(0, 3);
});
</script>

<template>
  <div class="bg-base-white block rounded-lg p-3 mb-2 cursor-pointer">
    <div class="flex items-center gap-4 mb-3">
      <SkeletonsSkeletonLoader
        width="w-10"
        height="h-10"
        radius="rounded-full"
      />
      <div>
        <SkeletonsSkeletonLoader
          width="w-52"
          height="h-4"
          radius="rounded-lg"
          class="mb-2"
        />
        <SkeletonsSkeletonLoader
          width="w-10"
          height="h-3"
          radius="rounded-lg"
        />
      </div>
    </div>
    <div>
      <SkeletonsSkeletonLoader
        v-for="i in random_widths"
        :key="i + 'skeleton'"
        :width="i"
        height="h-3"
        radius="rounded-lg"
        class="mb-2"
      />
    </div>
  </div>
</template>
