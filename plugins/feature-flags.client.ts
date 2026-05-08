export default defineNuxtPlugin(async () => {
  await useFeatureFlags()
    .load()
    .catch(() => {});
});
