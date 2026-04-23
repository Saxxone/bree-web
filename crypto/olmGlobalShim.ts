/**
 * Side-effect-only module. Must be imported BEFORE `@matrix-org/olm`.
 *
 * `@matrix-org/olm`'s UMD build decides at module-load time between a
 * browser random source (`window.crypto.getRandomValues`) and a Node one
 * (`require("crypto").randomBytes`). Inside a Vite-built module Web Worker
 * neither `window` nor a real `module.exports` exists, so olm would pick the
 * Node branch — Vite statically rewrites `require("crypto")` into an
 * externalised stub, which then warns
 *   'Module "crypto" has been externalized for browser compatibility.'
 * and fails at runtime.
 *
 * We alias `window` to `globalThis` so olm takes the browser branch, which
 * resolves to `globalThis.crypto.getRandomValues` — that API is available in
 * dedicated workers.
 *
 * We also predeclare `OLM_OPTIONS`. Olm's `init()` does a bare assignment
 * `OLM_OPTIONS = opts`, which under ES module strict mode throws
 * `ReferenceError: OLM_OPTIONS is not defined` unless a global binding of that
 * name already exists.
 */

declare global {
  // eslint-disable-next-line no-var
  var OLM_OPTIONS: Record<string, unknown> | undefined;
}

const g = globalThis as {
  window?: unknown;
  OLM_OPTIONS?: unknown;
};

if (typeof g.window === "undefined") {
  g.window = globalThis;
}
if (typeof g.OLM_OPTIONS === "undefined") {
  g.OLM_OPTIONS = {};
}

export {};
