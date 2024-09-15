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
) {
  const api_url = import.meta.env.VITE_API_BASE_URL;
  const authStore = useAuthStore();

  const url = `${api_url}${path}`;

  const response: Res | Error = await $fetch<Res>(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authStore.access_token,
    },
    body: body ?? undefined,

    async onRequest({ request, options }) {
      options.query = options.query || {};

      console.log("[fetch request]", request, options);
    },

    async onRequestError({ request, error }) {
      // Log error
      console.log("[fetch request error]", request, error);
    },

    async onResponse({ request, response }) {
      // Log response
      console.log("[fetch response]", request, response.status, response.body);
    },

    async onResponseError({ request, response }) {
      // Log error response
      console.log(
        "[fetch response error]",
        request,
        response.status,
        response.body,
      );
    },
  }).catch((error) => error.data as Error);

  return response;
}
