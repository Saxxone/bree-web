import type { CredentialResponse } from "~/types/types";

declare global {
  interface Window {
    adsbygoogle: { [key: string]: unknown }[];
    handleCredentialResponse: (response: CredentialResponse) => void;
  }
}
