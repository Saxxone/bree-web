import type { Pagination } from "~/types/types";

/** Avoid `cursor=undefined` in the query string (encodeURIComponent coerces undefined to the literal "undefined"). */
export function postsPaginationQuery(params: Pagination): string {
  const search = new URLSearchParams();
  search.set("take", String(params.take ?? 10));
  search.set("skip", String(params.skip ?? 0));
  const c = params.cursor;
  if (c != null && c !== "") {
    search.set("cursor", String(c));
  }
  return search.toString();
}
