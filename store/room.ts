import api_routes from "~/utils/api_routes";
import type { Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import { FetchMethod } from "~/types/types";
import type { Chat, Room } from "~/types/chat";

/**
 * When `cursor` is undefined, we must not put it in the query string: otherwise
 * `encodeURIComponent(undefined)` becomes the literal "undefined" and the API
 * applies Prisma cursor pagination with id "undefined", returning no rows.
 */
function buildRoomPaginationQuery(pagination: Pagination): string {
  const params = new URLSearchParams();
  params.set("skip", String(pagination.skip ?? 0));
  params.set("take", String(pagination.take ?? 10));
  const c = pagination.cursor;
  if (c !== undefined && c !== null && c !== "") {
    params.set("cursor", String(c));
  }
  return params.toString();
}

export const useRoomStore = defineStore("chats", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;
  const roomId = ref<string>();
  /**
   * Cached rooms (by id) so that chat bubbles can resolve sender-device
   * identity keys without drilling the whole participants list through a
   * chain of props. Populated when the messaging UI loads a room.
   */
  const activeRoomsById = shallowReactive(new Map<string, Room>());

  function cacheRoom(room: Room | null | undefined) {
    if (!room?.id) return;
    activeRoomsById.set(room.id, room);
  }

  async function getRooms(
    rooms: Room[],
    pagination: Pagination = { cursor: rooms?.[0].id, skip: 0, take: 10 },
    deviceId?: string,
  ) {
    const deviceQuery = deviceId
      ? `&deviceId=${encodeURIComponent(deviceId)}`
      : "";
    const response = await useApiConnect<Partial<Room>, Room[]>(
      `${api_routes.room.rooms}?${buildRoomPaginationQuery(pagination)}${deviceQuery}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return await mergeArraysWithoutDuplicates(
        response,
        rooms,
        "id",
        processChat<Room>,
      );
    }
  }

  async function getRoom(id: string, deviceId?: string): Promise<Room | null> {
    const deviceQuery = deviceId
      ? `?deviceId=${encodeURIComponent(deviceId)}`
      : "";
    const response = await useApiConnect<Partial<Room>, Room>(
      `${api_routes.room.room(id)}${deviceQuery}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      cacheRoom(response);
      return response;
    }
  }

  async function findRoomByParticipantsOrCreate(
    user1Id: string,
    user2Id: string,
    deviceId?: string,
  ): Promise<Room | null> {
    const deviceQuery = deviceId
      ? `&deviceId=${encodeURIComponent(deviceId)}`
      : "";
    const response = await useApiConnect<Partial<Room>, Room>(
      `${api_routes.room.findRoomByParticipantsOrCreate(user1Id, user2Id)}${deviceQuery}`,
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      cacheRoom(response);
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
    deviceId?: string,
  ): Promise<Chat[]> {
    const qs = buildRoomPaginationQuery(pagination);
    const deviceQuery = deviceId
      ? `&deviceId=${encodeURIComponent(deviceId)}`
      : "";
    const response = await useApiConnect<Partial<Chat>, Chat[]>(
      `${api_routes.room.chats(roomId)}?${qs}${deviceQuery}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
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
    activeRoomsById,
    cacheRoom,
    getRooms,
    getRoom,
    findRoomByParticipantsOrCreate,
    viewRoomChats,
  };
});
