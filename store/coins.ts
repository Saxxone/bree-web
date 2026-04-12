import type {
  CoinBalanceResponse,
  CoinPackage,
  CoinQuoteResponse,
  CoinStripeCheckoutResponse,
  CoinUnlockResponse,
} from "~/types/coins";
import type { Error } from "~/types/types";
import { FetchMethod } from "~/types/types";
import api_routes from "~/utils/api_routes";

export function isApiError(x: unknown): x is Error {
  return (
    typeof x === "object" &&
    x !== null &&
    "type" in x &&
    (x as Error).type === "error" &&
    "message" in x
  );
}

export function isInsufficientCoinsError(x: unknown): boolean {
  return isApiError(x) && x.code === "INSUFFICIENT_COINS";
}

export const useCoinsStore = defineStore("coins", () => {
  const balanceMinor = ref<number | null>(null);

  async function quotePost(postId: string): Promise<CoinQuoteResponse | Error> {
    return useApiConnect<null, CoinQuoteResponse>(
      api_routes.coins.quote(postId),
      FetchMethod.GET,
    );
  }

  async function unlockPost(
    postId: string,
  ): Promise<CoinUnlockResponse | Error> {
    return useApiConnect<null, CoinUnlockResponse>(
      api_routes.coins.unlock(postId),
      FetchMethod.POST,
    );
  }

  async function fetchBalance(): Promise<CoinBalanceResponse | Error> {
    const res = await useApiConnect<null, CoinBalanceResponse>(
      api_routes.coins.balance,
      FetchMethod.GET,
    );
    if (!isApiError(res)) {
      balanceMinor.value = res.balanceMinor;
    }
    return res;
  }

  async function fetchPackages(): Promise<CoinPackage[] | Error> {
    return useApiConnect<null, CoinPackage[]>(
      api_routes.coins.packages,
      FetchMethod.GET,
    );
  }

  async function createStripeCheckoutSession(
    packageId: string,
  ): Promise<CoinStripeCheckoutResponse | Error> {
    return useApiConnect<{ packageId: string }, CoinStripeCheckoutResponse>(
      api_routes.coins.checkoutStripe,
      FetchMethod.POST,
      { packageId },
    );
  }

  return {
    balanceMinor,
    quotePost,
    unlockPost,
    fetchBalance,
    fetchPackages,
    createStripeCheckoutSession,
  };
});
