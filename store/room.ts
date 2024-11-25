import api_routes from "~/utils/api_routes";
import type { Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { FetchMethod } from "~/types/types";
import type { Chat, Room } from "~/types/chat";

export const useRoomStore = defineStore("chats", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const roomId = ref<string>();

  async function getRooms(
    rooms: Room[],
    pagination: Pagination = { cursor: rooms?.[0].id, skip: 0, take: 10 },
  ) {
    const response = await useApiConnect<Partial<Room>, Room[]>(
      `${api_routes.room.rooms}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return rooms;
    } else {
      return await mergeArraysWithoutDuplicates(
        response,
        rooms,
        "id",
        processChat<Room>,
      );
    }
  }

  async function getRoom(id: string): Promise<Room | null> {
    const response = await useApiConnect<Partial<Room>, Room>(
      api_routes.room.room(id),
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return null;
    } else {
      return response;
    }
  }

  async function findRoomByParticipantsOrCreate(
    user1Id: string,
    user2Id: string,
  ): Promise<Room | null> {
    const response = await useApiConnect<Partial<Room>, Room>(
      api_routes.room.findRoomByParticipantsOrCreate(user1Id, user2Id),
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return null;
    } else {
      return response;
    }
  }

  async function processChat<T>(chat: T): Promise<T> {
    return chat;
  }

  async function viewRoomChats(
    chats: Chat[],
    roomId: string,
    pagination: Pagination = { cursor: chats?.[0].id, skip: 0, take: 10 },
  ): Promise<Chat[]> {
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.room.chats(roomId)}?cursor=${encodeURIComponent(pagination.cursor as string)}&skip=${encodeURIComponent(pagination.skip as number)}&take=${encodeURIComponent(pagination.take as number)}`,
      FetchMethod.GET,
    );

    if ("status" in response || "statusCode" in response) {
      addSnack({ ...response, type: "error" });
      return chats;
    } else {
      return await mergeArraysWithoutDuplicates(
        response,
        chats,
        "id",
        processChat<Chat>,
      );
    }
  }

  return {
    roomId,
    getRooms,
    getRoom,
    findRoomByParticipantsOrCreate,
    viewRoomChats,
  };
});
