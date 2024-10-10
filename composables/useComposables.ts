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
) {
  const processedArray = await Promise.all(inputArray.map(cb));
  outputArray = outputArray.filter(
    (arr) => !processedArray.every((a) => a[j] === arr[k]),
  );
  outputArray.unshift(...processedArray);
  return outputArray;
}
