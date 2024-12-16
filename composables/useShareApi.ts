import { useGlobalStore } from "~/store/global";

export function useShareApi(url: string, text: string) {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  const { isSupported } = useShare();

  if (isSupported) {
    navigator
      .share({
        title: "Check out this post!",
        text: text,
        url: url,
      })
      .then(() => {
        addSnack({
          message: "Post shared successfully!",
          type: "success",
        });
      })
      .catch((error) => {
        addSnack({
          message: error.message,
          type: "info",
        });
      });
  } else {
    globalStore.addSnack({
      message: "browser not supported",
      type: "error",
    });
    // Example: Copying URL to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        globalStore.addSnack({
          message: "Post url copied to clipboard!",
          type: "success",
        });
      })
      .catch((error) => {
        globalStore.addSnack({
          message: error.message,
          type: "error",
        });
      });
  }
}
