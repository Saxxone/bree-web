export function useToLowerCase(string: string) {
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

export async function mergeArraysWithoutDuplicates<T>(
  arrA: Array<T>,
  arrB: Array<T>,
  key: keyof T,
  cb?: (t: T) => Promise<T>,
) {
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

export function useIsBase64(
  str: string | JsonWebKey | ArrayBuffer | null,
): boolean {
  if (!str || (typeof str === "string" && (str === "" || str.trim() === ""))) {
    return false;
  }

  if (typeof str !== "string") {
    // Handle non-string types
    return false; // Or implement your logic for JsonWebKey and ArrayBuffer if needed
  }

  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
}

export function useBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
