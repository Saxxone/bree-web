/**
 * Runtime package is ESM with `export { Plyr as default }`, but the published
 * typings use `export=` which breaks default ESM imports in tooling.
 */
declare module "plyr" {
  class Plyr {
    constructor(
      targets: NodeList | HTMLElement | HTMLElement[] | string,
      options?: Plyr.Options,
    );
    destroy(callback?: (...args: unknown[]) => void, soft?: boolean): void;
  }
  namespace Plyr {
    type Options = import("plyr/src/js/plyr").Plyr.Options;
  }
  export default Plyr;
}
