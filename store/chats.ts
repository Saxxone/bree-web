import api_routes from "~/utils/api_routes";
import type { Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { FetchMethod } from "~/types/types";
import type { Chat, Room } from "~/types/chat";

export const useChatStore = defineStore("chats", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const roomId = ref<string>();

  async function getRooms(chats: Room[], pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 }) {
    const response = await useApiConnect<Partial<Room>, Room[]>(
      `${api_routes.chats.rooms}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.POST
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await preventDuplicatesInArray(response, "id", chats, "id", processChat<Room>);
    }
  }

  async function processChat<T>(chat: T): Promise<T> {
    return chat;
  }

  async function viewMessages(chats: Chat[], id: string, pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 }) {
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.chats.view(id)}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET
    );

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await preventDuplicatesInArray(response, "id", chats, "id", processChat<Chat>);
    }
  }

  async function sendMessage(message: Chat, recipientId: string, chats: Chat[]) {
    const response = await useApiConnect<Partial<Chat>, Chat>(api_routes.chats.create, FetchMethod.POST, message);

    if ("statusCode" in response) addSnack({ ...response, type: "error" });
    else {
      return await preventDuplicatesInArray([response], "id", chats, "id", processChat<Chat>, "push");
    }
  }

  return {
    roomId,
    getRooms,
    viewMessages,
    sendMessage,
  };
});
