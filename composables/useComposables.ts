import type { DateString } from "~/types/types";

/**
 * Converts a string to lowercase.
 *
 * @param {string} string - The input string.
 * @returns {string} The lowercase version of the input string.
 */
export function useToLowerCase(string: string): string {
  return string.toLowerCase();
}

export async function useDynamicScroll<Result>(
  el: HTMLElement,
  cb: () => Promise<Result>,
) {
  return await cb();
}

export async function preventDuplicatesInArray<A>(
  inputArray: A[],
  j: keyof A,
  outputArray: A[],
  k: keyof A,
  cb: (t: A) => Promise<A>,
  insertMethod: "push" | "unshift" = "unshift",
) {
  const processedArray = await Promise.all(inputArray.map(cb));
  outputArray = outputArray.filter(
    (arr) => !processedArray.every((a) => a[j] === arr[k]),
  );
  outputArray[insertMethod](...processedArray);
  return outputArray;
}

/**
 * Merges two arrays of objects into a single array without duplicate objects, based on a provided key.
 *
 * @template T The type of objects in the arrays.
 * @param {T[]} arrA - The first array of objects.
 * @param {T[]} arrB - The second array of objects.
 * @param {keyof T} key - The key to use for identifying duplicate objects.
 * @param {(t: T) => Promise<T>} [cb] - An optional asynchronous callback function to apply to each object in the resulting array.
 * @returns {Promise<T[]>} A Promise that resolves to the merged array of objects without duplicates.
 */
export async function mergeArraysWithoutDuplicates<T>(
  arrA: Array<T>,
  arrB: Array<T>,
  key: keyof T,
  cb?: (t: T) => Promise<T>,
): Promise<T[]> {
  const combinedMap = new Map();

  arrA.forEach((obj) => {
    combinedMap.set(obj[key], obj);
  });

  arrB.forEach((obj) => {
    combinedMap.set(obj[key], obj);
  });

  const result = Array.from(combinedMap.values());
  if (cb) return await Promise.all(result.map(cb));

  return result;
}

/**
 * Checks if a given string is a valid base64 encoded string.
 *
 * @param {string | JsonWebKey | ArrayBuffer | null} str - The string to check.  Can also be JsonWebKey or ArrayBuffer, but these will return false.
 * @returns {boolean} True if the string is base64 encoded, false otherwise.  Returns false if the input is not a string, is null, or is empty/whitespace.
 */

export function useIsBase64(
  str: string | JsonWebKey | ArrayBuffer | null,
): boolean {
  if (!str || (typeof str === "string" && (str === "" || str.trim() === ""))) {
    return false;
  }

  if (typeof str !== "string") {
    // Handle non-string types
    return false;
  }

  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
}

/**
 * Converts a base64 string to an ArrayBuffer.
 *
 * @param {string} base64 - The base64 string to convert.
 * @returns {ArrayBuffer} The ArrayBuffer representation of the base64 string.
 */
export function useBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Formats a given date as a relative time string (e.g., "a few seconds ago", "2 minutes ago").
 * Handles both Date objects and ISO 8601 date strings (DateString).
 *
 * @param {Date | DateString} date - The date to format.
 * @returns {string} A string representing the relative time.  Returns "Invalid Date" if the input is an invalid date.
 */
export function useTimeAgo(date: Date | DateString): string {
  try {
    const inputDate = typeof date === "string" ? new Date(date) : date;

    if (isNaN(inputDate.getTime())) {
      return "Invalid Date";
    }

    const seconds = Math.round(
      (new Date().getTime() - inputDate.getTime()) / 1000,
    );
    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + "y";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return (
        Math.floor(interval) + "month" + (Math.floor(interval) > 1 ? "s" : "")
      );
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + "d";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "m";
    }
    if (seconds < 10) {
      return "a few seconds ago";
    }
    return Math.floor(seconds) + "s";
  } catch (error) {
    return "Invalid Date";
  }
}
