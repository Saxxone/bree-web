import type { InjectionKey, Ref } from "vue";

/** Scroll column in `layouts/social.vue` — used by virtualized feed + intersection observers. */
export const socialMainScrollElKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol("socialMainScrollEl");
