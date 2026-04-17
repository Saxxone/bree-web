/**
 * Post body rich text: URL/mention detection, escaping, and HTML for display vs editor mirror.
 * Tokenization is word-split on spaces (see plan); multi-space and trailing punctuation edge cases remain.
 */

export const url_pattern =
  /\b(https?:\/\/[a-z0-9.-]+[^\s]*)|\b(www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s]*)|\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](?:\/[^\s]*)?/gi;

export const mention_pattern = /(?:^|\s)(\.?[@][a-zA-Z0-9_]{1,})(?:\b|$|\s)/g;

const DISPLAY_ACCENT = "font-semibold text-violet-600 dark:text-violet-400";
const EDITOR_ACCENT = "text-violet-600 dark:text-violet-400";
const LINK_CLASS = `${DISPLAY_ACCENT} decoration-violet-600/50 dark:decoration-violet-400/50`;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Safe href for a URL-like token, or null if unusable. */
export function hrefForUrlToken(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (/^www\./i.test(candidate)) {
    candidate = `https://${candidate}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Username (no @) and optional leading-dot mention form, aligned with /profile/[id]. */
export function parseMentionFromToken(word: string): {
  leadingDot: boolean;
  username: string;
} | null {
  mention_pattern.lastIndex = 0;
  if (!word.match(mention_pattern)) return null;

  let username: string;
  let leadingDot = false;
  if (word.startsWith(".")) {
    leadingDot = true;
    username = word.slice(2);
  } else {
    username = word.slice(1);
  }
  if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) return null;
  return { leadingDot, username };
}

function mapSpaceDelimitedTokens(
  text: string,
  mapWord: (word: string) => string,
): string {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => (word === "" ? "" : mapWord(word)))
    .join(" ");
}

export function formatRichTextDisplayHtml(text: string): string {
  return mapSpaceDelimitedTokens(text, (word) => {
    url_pattern.lastIndex = 0;
    if (word.match(url_pattern)) {
      const href = hrefForUrlToken(word);
      const escapedWord = escapeHtml(word);
      if (!href) return escapedWord;
      return `<a class="${LINK_CLASS}" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapedWord}</a>`;
    }

    mention_pattern.lastIndex = 0;
    if (word.match(mention_pattern)) {
      const m = parseMentionFromToken(word);
      if (!m) return escapeHtml(word);
      const path = `/profile/${encodeURIComponent(m.username)}`;
      const prefix = m.leadingDot ? "." : "";
      return `${prefix}<a class="${LINK_CLASS}" href="${escapeHtml(path)}">@${escapeHtml(m.username)}</a>`;
    }

    return escapeHtml(word);
  });
}

export function formatRichTextEditorOverlayHtml(text: string): string {
  return mapSpaceDelimitedTokens(text, (word) => {
    url_pattern.lastIndex = 0;
    if (word.match(url_pattern)) {
      return `<span class="${EDITOR_ACCENT}">${escapeHtml(word)}</span>`;
    }

    mention_pattern.lastIndex = 0;
    if (word.match(mention_pattern)) {
      const m = parseMentionFromToken(word);
      if (!m) return escapeHtml(word);
      const prefix = m.leadingDot ? "." : "";
      return `${prefix}<span class="${EDITOR_ACCENT}">${escapeHtml(`@${m.username}`)}</span>`;
    }

    return escapeHtml(word);
  });
}
