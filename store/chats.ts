import api_routes from "~/utils/api_routes";
import type { Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { FetchMethod } from "~/types/types";
import type { Chat } from "~/types/chat";

export const useChatStore = defineStore("chats", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  async function getChats(
    chats: Chat[],
    pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 },
  ) {
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.chats.list}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.POST,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await preventDuplicatesInArray(
        response,
        "id",
        chats,
        "id",
        processChat,
      );
    }
  }

  async function processChat(chat: Chat) {
    return chat;
  }

  async function getMessages(
    chats: Chat[],
    pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 },
  ) {
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.chats.list}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.POST,
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await preventDuplicatesInArray(
        response,
        "id",
        chats,
        "id",
        processChat,
      );
    }
  }

  return {
    getChats,
    getMessages,
  };
});
