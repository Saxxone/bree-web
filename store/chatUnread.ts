import { defineStore } from "pinia";

export const useChatUnreadStore = defineStore("chatUnread", () => {
  const hasUnreadMessages = ref(false);

  function setIncomingPeerMessage() {
    hasUnreadMessages.value = true;
  }

  function clearUnread() {
    hasUnreadMessages.value = false;
  }

  return {
    hasUnreadMessages,
    setIncomingPeerMessage,
    clearUnread,
  };
});
