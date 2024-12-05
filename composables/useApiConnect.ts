import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { Error } from "~/types/types";

enum FetchMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
//
export async function useApiConnect<Body, Res>(
  path: string,
  method: FetchMethod = FetchMethod.GET,
  body?: Body,
  content_type: string = "application/json",
  cache: RequestCache = "no-cache",
) {
  const api_url = import.meta.env.VITE_API_BASE_URL;
  const authStore = useAuthStore();
  const { logout } = authStore;
  const globalStore = useGlobalStore();
  const { api_loading } = storeToRefs(globalStore);

  api_loading.value = true;

  const url = `${api_url}${path.startsWith("/") ? path : "/" + path.replace(/^\//, "")}`;

  let err: Error = {
    message: "An unknown error occurred",
    statusCode: 500,
    status: 500,
    isError: true,
  };

  const res = await $fetch<Res>(url, {
    method,
    headers: {
      ...(content_type !== "multipart/form-data" && {
        "Content-Type": content_type,
      }),
      Authorization: "Bearer " + authStore.access_token,
      enctype: "multipart/form-data",
    },
    body: body ?? undefined,
    cache: cache,

    async onRequest({ options }) {
      options.query = options.query || {};

      // modify request or options
    },

    async onRequestError() {
      // handle error
    },

    async onResponse() {
      // handle response
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        logout();
      }
      err = {
        message: response.statusText,
        statusCode: response.status,
      } as Error;
    },
  }).catch((error) => {
    if (error.statusCode === 401 || error.status === 401) {
      logout();
      return err;
    }
    err = error.data as Error;
    return err;
  });

  api_loading.value = false;

  if (!res) return err;

  return res;
}
