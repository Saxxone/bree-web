import api_routes from "~/utils/api_routes";
import type { Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { FetchMethod } from "~/types/types";
import type { Chat, Room } from "~/types/chat";

export const useChatStore = defineStore("chats", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const roomId = ref<string>();

  async function getRooms(rooms: Room[], pagination: Pagination = { cursor: rooms?.[0].id, skip: 0, take: 10 }) {
    const response = await useApiConnect<Partial<Room>, Room[]>(
      `${api_routes.chats.rooms}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return rooms;
    } else {
      return await preventDuplicatesInArray(response, "id", rooms, "id", processChat<Room>);
    }
  }

  async function getRoom(id: string): Promise<Room | null> {
    const response = await useApiConnect<Partial<Room>, Room>(api_routes.chats.room(id), FetchMethod.GET);

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return null;
    } else {
      return response;
    }
  }

  async function processChat<T>(chat: T): Promise<T> {
    return chat;
  }

  async function viewRoomChats(chats: Chat[], id: string, pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 }): Promise<Chat[]> {
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.chats.roomChats(id)}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET
    );

    if ("statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return chats;
    } else {
      return await preventDuplicatesInArray(response, "id", chats, "id", processChat<Chat>);
    }
  }

  return {
    roomId,
    getRooms,
    getRoom,
    viewRoomChats,
  };
});
