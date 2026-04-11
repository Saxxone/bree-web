import type { MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";

export function usePostMediaGridClasses(mediaCount: MaybeRefOrGetter<number>) {
  return computed(() => {
    switch (toValue(mediaCount)) {
      case 1:
        return "grid grid-cols-1";
      case 2:
      case 3:
        return "grid grid-cols-2 gap-1";
      default:
        return "grid grid-cols-2 gap-1 grid-rows-2";
    }
  });
}
