import { useAuthStore } from "~/store/auth";
import type { Error } from "~/types/types";

enum FetchMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export async function useApiConnect<Body, Res>(
  path: string,
  method: FetchMethod = FetchMethod.GET,
  body?: Body,
  cache: RequestCache = "no-cache",
) {
  const api_url = import.meta.env.VITE_API_BASE_URL;
  const authStore = useAuthStore();

  const url = `${api_url}${path}`;

  const response = await $fetch<Res>(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authStore.access_token,
    },
    body: body ?? undefined,
    cache: cache,

    async onRequest({ request, options }) {
      options.query = options.query || {};

      // modify request or options
    },

    async onRequestError({ request, error }) {
      // handle error
    },

    async onResponse({ request, response }) {
      // handle response
    },

    async onResponseError({ request, response }) {
      // handle error response
    },
  }).catch((error) => {
    if (error.status === 401) {
      authStore.logout();
      return
    }
    return error.data as Error
  });


  if(!response) return {  message: "Something went wrong" , statusCode: 500 } as Error;

  return response;
}
