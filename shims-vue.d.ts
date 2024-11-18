declare let URL: typeof globalThis.URL;

declare global {
  interface Window { handleCredentialResponse: any; }
}