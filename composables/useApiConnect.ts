import { storeToRefs } from "pinia";
import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { Error } from "~/types/types";
import { FetchMethod } from "~/types/types";

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Makes an API call with automatic token refresh handling.
 *
 * @template Body The type of the request body
 * @template Res The type of the expected response data
 * @param {string} path - The API endpoint path. Should start with a '/'
 * @param {FetchMethod} [method=FetchMethod.GET] - The HTTP method to use
 * @param {Body} [body] - The request body data
 * @param {string} [content_type="application/json"] - The Content-Type header value
 * @param {RequestCache} [cache="no-cache"] - Cache setting for request
 * @param {RetryConfig} [retryConfig] - Configuration for request retries
 * @returns {Promise<Res | Error>} API response data or Error object
 */

export async function useApiConnect<Body, Res>(
  path: string,
  method: FetchMethod = FetchMethod.GET,
  body?: Body,
  content_type: string = "application/json",
  cache: RequestCache = "no-cache",
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
): Promise<Res | Error> {
  const api_url = import.meta.env.VITE_API_BASE_URL;
  const authStore = useAuthStore();
  const { logout } = authStore;
  const globalStore = useGlobalStore();
  const { api_loading } = storeToRefs(globalStore);

  const createHeaders = (accessToken: string) => ({
    ...(content_type !== "multipart/form-data" && {
      "Content-Type": content_type,
    }),
    Authorization: `Bearer ${accessToken}`,
    ...(content_type === "multipart/form-data" && {
      enctype: "multipart/form-data",
    }),
  });

  const makeRequest = async (retry_count: number): Promise<Res | Error> => {
    api_loading.value = true;

    const url = `${api_url}${path.startsWith("/") ? path : "/" + path.replace(/^\//, "")}`;

    let err: Error = {
      message: "An unknown error occurred",
      status: 500,
      type: "error",
    };

    try {
      const res = await $fetch<Res>(url, {
        method,
        headers: createHeaders(authStore.access_token),
        body: body ?? undefined,
        cache: cache,

        async onRequest({ options }) {
          options.query = options.query || {};
        },

        async onRequestError({ response }) {
          // handle error
          err = {
            message:
              response?._data?.message ||
              response?.statusText ||
              "An unknown error occurred",
            status: response?.status ?? response?._data?.statusCode ?? 500,
            type: "error",
          };
        },

        async onResponse() {
          // handle response
        },

        async onResponseError({ response }) {
          if (response.status === 401 && retry_count < retryConfig.maxRetries) {
            try {
              // Attempt to refresh the token
              const refreshed = await authStore.refreshAccessToken(
                authStore.refresh_token,
              );
              if (refreshed) {
                await new Promise((resolve) =>
                  setTimeout(resolve, retryConfig.retryDelay),
                );
                makeRequest(retry_count + 1);
              }
            } catch {
              logout();
              throw err;
            }
          }
          err = {
            ...err,
            message: response.statusText,
            status: response.status || response._data.statusCode || 500,
          } as Error;
        },
      }).catch((error) => {
        if (error.statusCode === 401 || error.status === 401) {
          logout();
          return err;
        }
        err = { ...err, ...error.data } as Error;
        return err;
      });

      api_loading.value = false;

      if (!res) return err;

      return res;
    } catch (error: any) {
      if (error.status === 401 || error.statusCode === 401) {
        if (retry_count < retryConfig.maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryConfig.retryDelay),
          );
          return makeRequest(retry_count + 1);
        }
        logout();
        return err;
      }

      err = {
        ...err,
        message: error.data?.message || error.message || err.message,
        status: error.status || error.statusCode || err.status,
      };
      return err;
    } finally {
      api_loading.value = false;
    }
  };

  return makeRequest(0);
}
