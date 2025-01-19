import type { CredentialResponse } from "~/types/types";

interface GoogleAuthOptions {
  type: "standard";
  shape: "rectangular";
  theme: "outline";
  text: "signin_with";
  size: "large";
  logo_alignment: "left" | "right";
}

interface Initialize {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          renderButton: (element: Element, options: GoogleAuthOptions) => void;
          initialize: (options: Initialize) => void;
        };
      };
    };
    adsbygoogle: { [key: string]: unknown }[];
    handleCredentialResponse: (response: CredentialResponse) => void;
  }
}
