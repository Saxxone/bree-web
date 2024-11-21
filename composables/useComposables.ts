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
  arrA: T[],
  arrB: T[],
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
