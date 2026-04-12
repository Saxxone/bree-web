/** GET /coins/quote/:postId */
export interface CoinQuoteResponse {
  postId: string;
  pricedCostMinor: number;
  sourceStreamQuality: string;
  chargeMinor: number;
  alreadyUnlocked: boolean;
  creatorShareIfChargedMinor: number;
  platformShareIfChargedMinor: number;
  breakdown: {
    costMinor: number;
    recomputedCostMinor: number;
    [key: string]: unknown;
  };
}

/** POST /coins/unlock/:postId */
export interface CoinUnlockResponse {
  unlocked: boolean;
  chargedMinor: number;
  pricedCostMinor: number;
  sourceStreamQuality: string;
  alreadyUnlocked: boolean;
  creatorCreditedMinor?: number;
  platformFeeMinor?: number;
}

export interface CoinBalanceResponse {
  balanceMinor: number;
}

/** GET /coins/packages */
export interface CoinPackage {
  id: string;
  name: string;
  coinsMinor: number;
  stripePriceId: string | null;
  appleProductId: string | null;
  googleProductId: string | null;
  sortOrder: number;
}

/** POST /coins/checkout/stripe */
export interface CoinStripeCheckoutResponse {
  url: string;
  sessionId: string;
}
