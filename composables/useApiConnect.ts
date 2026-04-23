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

type ApiErrorBody = {
  message?: string;
  status?: number;
  statusCode?: number;
  code?: string;
};

function pickCode(data: ApiErrorBody | undefined): string | undefined {
  const c = data?.code;
  return typeof c === "string" && c.trim() ? c : undefined;
}

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

  const createHeaders = (access_token: string) => ({
    ...(content_type !== "multipart/form-data" && {
      "Content-Type": content_type,
    }),
    Authorization: `Bearer ${access_token}`,
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
          const data = response?._data as ApiErrorBody | undefined;
          const code = pickCode(data);
          err = {
            message:
              data?.message ||
              response?.statusText ||
              "An unknown error occurred",
            status: response?.status ?? data?.status ?? data?.statusCode ?? 500,
            type: "error",
            ...(code ? { code } : {}),
          };
        },

        async onResponse() {
          // handle response
        },

        async onResponseError({ response }) {
          const data = response._data as ApiErrorBody | undefined;
          const bodyMessage =
            typeof data?.message === "string" && data.message.trim()
              ? data.message
              : undefined;
          const statusFromBody =
            typeof data?.status === "number"
              ? data.status
              : typeof data?.statusCode === "number"
                ? data.statusCode
                : undefined;

          const code = pickCode(data);
          err = {
            ...err,
            message:
              bodyMessage ||
              err.message ||
              response.statusText ||
              "An unknown error occurred",
            status: response.status || statusFromBody || err.status || 500,
            type: "error",
            ...(code ? { code } : {}),
          };

          // 401 recovery happens in the outer try/catch below. `$fetch`
          // ignores the return value of `onResponseError`, so any retry
          // started here would be fire-and-forget and silently drop the
          // replacement response.
        },
      }).catch(
        (error: {
          statusCode?: number;
          status?: number;
          data?: ApiErrorBody;
          message?: string;
        }) => {
          // Let 401s bubble to the outer catch so the shared retry-with-
          // refresh path handles them. Returning here would log the user
          // out before `refreshAccessToken` ever runs.
          if (error.statusCode === 401 || error.status === 401) {
            throw error;
          }
          const d = error.data;
          const code = pickCode(d);
          err = {
            type: "error",
            status: error.statusCode ?? error.status ?? d?.status ?? err.status,
            message:
              (typeof d?.message === "string" && d.message.trim()
                ? d.message
                : undefined) ||
              error.message ||
              err.message,
            ...(code ? { code } : {}),
          };
          return err;
        },
      );

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

      const d = error.data as ApiErrorBody | undefined;
      const code = pickCode(d);
      err = {
        ...err,
        message:
          (typeof d?.message === "string" && d.message.trim()
            ? d.message
            : undefined) ||
          error.message ||
          err.message,
        status: error.status || error.statusCode || d?.status || err.status,
        type: "error",
        ...(code ? { code } : {}),
      };
      return err;
    } finally {
      api_loading.value = false;
    }
  };

  return makeRequest(0);
}
