import { useAuthStore } from "~/store/auth";
import { useGlobalStore } from "~/store/global";
import type { Error as ApiSnack } from "~/types/types";
import api_routes from "~/utils/api_routes";

function parseUploadResponse(
  xhr: XMLHttpRequest,
): { ok: true; ids: string[] } | { ok: false; error: ApiSnack } {
  let data: unknown;
  try {
    data = JSON.parse(xhr.responseText) as unknown;
  } catch {
    return {
      ok: false,
      error: {
        type: "error",
        message: "Invalid server response",
        status: xhr.status || 500,
      },
    };
  }

  if (xhr.status >= 200 && xhr.status < 300 && Array.isArray(data)) {
    if (data.every((x) => typeof x === "string")) {
      return { ok: true, ids: data as string[] };
    }
  }

  const msg =
    typeof (data as { message?: string })?.message === "string"
      ? (data as { message: string }).message
      : "Upload failed";

  return {
    ok: false,
    error: {
      type: "error",
      message: msg,
      status: xhr.status || 500,
    },
  };
}

/**
 * Uploads one or more files with XMLHttpRequest upload progress (does not toggle global `api_loading`).
 */
export async function uploadFilesWithProgress(
  files: File[],
  onProgress: (percent: number) => void,
): Promise<string[]> {
  if (!files.length) {
    onProgress(100);
    return [];
  }

  const api_url = import.meta.env.VITE_API_BASE_URL;
  const authStore = useAuthStore();
  const globalStore = useGlobalStore();
  const { addSnack } = globalStore;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append(file.name, file);
  });

  const url = `${api_url}${api_routes.files.upload}`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && e.total > 0) {
        onProgress(Math.min(100, Math.round((100 * e.loaded) / e.total)));
      }
    });

    xhr.addEventListener("load", () => {
      const parsed = parseUploadResponse(xhr);
      if (parsed.ok) {
        onProgress(100);
        resolve(parsed.ids);
        return;
      }
      addSnack(parsed.error);
      reject(new Error(parsed.error.message));
    });

    xhr.addEventListener("error", () => {
      const err: ApiSnack = {
        type: "error",
        message: "Network error during upload",
        status: 0,
      };
      addSnack(err);
      reject(new Error(err.message));
    });

    xhr.addEventListener("abort", () => {
      const err: ApiSnack = {
        type: "error",
        message: "Upload cancelled",
        status: 0,
      };
      addSnack(err);
      reject(new Error(err.message));
    });

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${authStore.access_token}`);
    xhr.send(formData);
  });
}
