import type { CredentialResponse } from "~/types/types";

declare global {
  interface Window {
    google: unknown;
    adsbygoogle: { [key: string]: unknown }[];
    handleCredentialResponse: (response: CredentialResponse) => void;
  }
}
