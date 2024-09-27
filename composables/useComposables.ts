export function useToLowerCase(string: string) {
  return string.toLowerCase();
}

export async function useDynamicScroll<Result>(el: HTMLElement, cb: () => Promise<Result>) {
  return await cb();
}
