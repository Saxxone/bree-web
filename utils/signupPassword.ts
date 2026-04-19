export type SignupPasswordIssue = "too_short" | "no_special";

const HAS_SPECIAL = /[^\p{L}\p{N}\s]/u;

export function signupPasswordMinLengthMet(
  password: string | undefined | null,
): boolean {
  return (password ?? "").length >= 8;
}

export function signupPasswordSpecialMet(
  password: string | undefined | null,
): boolean {
  return HAS_SPECIAL.test(password ?? "");
}

export function getSignupPasswordIssue(
  password: string | undefined | null,
): SignupPasswordIssue | null {
  const p = password ?? "";
  if (!signupPasswordMinLengthMet(p)) return "too_short";
  if (!signupPasswordSpecialMet(p)) return "no_special";
  return null;
}
