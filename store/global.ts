import type { Snack } from "~/types/types";

export const useGlobalStore = defineStore("global", () => {
  const snack_bars = ref<Snack[]>([]);

  function closeSnack(index: number) {
    snack_bars.value.splice(index, 1);
  }

  function addSnack(snack: Snack) {
    snack_bars.value.push(snack);
  }

  return { snack_bars, closeSnack, addSnack };
});
