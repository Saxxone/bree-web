import type { Post } from "~/types/post";
import api_routes from "~/utils/api_routes";
import { FetchMethod, type Pagination } from "~/types/types";
import { useGlobalStore } from "./global";
import type { User } from "~/types/user";

export const useUsersStore = defineStore("users", () => {
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  async function findUser(
    search_query: string,
    pagination: Pagination = { cursor: undefined, skip: 0, take: 10 },
    with_pk: boolean = false,
  ) {
    // Encode the free-text query once, then append pagination through
    // URLSearchParams so `cursor` is omitted when undefined. The old code
    // appended `&cursor=${encodeURIComponent(undefined)}` which serializes to
    // the literal string "undefined"; the API treated that as a real Prisma
    // cursor and returned zero rows on the very first search.
    const params = new URLSearchParams();
    params.set("skip", String(pagination.skip ?? 0));
    params.set("take", String(pagination.take ?? 10));
    if (
      pagination.cursor !== undefined &&
      pagination.cursor !== null &&
      pagination.cursor !== ""
    ) {
      params.set("cursor", String(pagination.cursor));
    }
    const query = `${encodeURIComponent(search_query)}&with_pk=${encodeURIComponent(with_pk)}`;
    const response = await useApiConnect<Partial<Post>, Post[]>(
      `${api_routes.users.search(query)}&${params.toString()}`,
      FetchMethod.POST,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return response;
    }
  }

  async function getUserProfile(id: string) {
    const response = await useApiConnect<string, User>(
      `${api_routes.users.get(id)}`,
      FetchMethod.GET,
    );

    if ("message" in response) {
      addSnack({ ...response });
      throw new Error(response.message);
    } else {
      return response;
    }
  }

  return {
    findUser,
    getUserProfile,
  };
});
