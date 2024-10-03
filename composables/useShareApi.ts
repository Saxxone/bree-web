import { useGlobalStore } from "~/store/global";

export function useShareApi(url: string, text: string) {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  const { share, isSupported } = useShare();

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
          statusCode: 200,
        });
      })
      .catch((error) => {
        addSnack({
          message: error.message,
          type: "info",
          statusCode: 600,
        });
      });
  } else {
    globalStore.addSnack({
      message: "browser not supported",
      type: "error",
      statusCode: 500,
    });
    // Example: Copying URL to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        globalStore.addSnack({
          message: "Post url copied to clipboard!",
          type: "success",
          statusCode: 200,
        });
      })
      .catch((error) => {
        globalStore.addSnack({
          message: error.message,
          type: "error",
          statusCode: 500,
        });
      });
  }
}
