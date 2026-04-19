/** Allowed username body after optional leading `@` (aligned with mention parsing). */
const USERNAME_BODY = /^[a-z0-9_]+$/;

/**
 * Trim, strip any leading `@` characters, lowercase.
 * Accepts both `username` and `@username` (and `@@name` → `name`).
 */
export function normalizeSignupUsername(
  raw: string | undefined | null,
): string {
  let s = (raw ?? "").trim();
  while (s.startsWith("@")) {
    s = s.slice(1).trim();
  }
  return s.toLowerCase();
}

export type SignupUsernameIssue = "empty" | "invalid_chars";

export function getSignupUsernameIssue(
  raw: string | undefined | null,
): SignupUsernameIssue | null {
  const n = normalizeSignupUsername(raw);
  if (!n) return "empty";
  if (!USERNAME_BODY.test(n)) return "invalid_chars";
  return null;
}
