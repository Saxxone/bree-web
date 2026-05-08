/**
 * Centralises compose / comment entry visibility so FAB and reply actions stay consistent.
 */
export function usePostingComposerUi() {
  const ff = useFeatureFlags();
  const canUploadVideo = computed(() => ff.enabled("posting.uploadVideo"));
  const canShortPost = computed(() => ff.enabled("posting.createShortPost"));
  const canLongPost = computed(() => ff.enabled("posting.createLongPost"));
  const canPost = computed(() => canShortPost.value || canLongPost.value);
  const anyCompose = computed(() => canUploadVideo.value || canPost.value);
  const canComment = computed(
    () => ff.enabled("posting.comments") && anyCompose.value,
  );

  return {
    canUploadVideo,
    canPost,
    anyCompose,
    canComment,
  };
}
