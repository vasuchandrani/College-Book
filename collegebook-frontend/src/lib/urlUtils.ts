/**
 * Shared URL validation and normalization utilities
 */

/**
 * Checks if a string is a valid web URL (HTTP or HTTPS, with a valid domain).
 * Rejects plain text names like "my project", "github", "name", etc.
 */
export const isValidHttpUrl = (str: string): boolean => {
  if (!str || typeof str !== "string") return false;
  const clean = str.trim();
  if (!clean) return false;

  // Cannot contain spaces or newline characters
  if (/\s/.test(clean)) return false;

  try {
    const urlToTest = clean.startsWith("http://") || clean.startsWith("https://")
      ? clean
      : `https://${clean}`;

    const parsed = new URL(urlToTest);

    // Protocol must be http: or https:
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname;

    // Host must contain a valid domain dot (e.g. github.com, domain.org, localhost)
    if (!host || host.startsWith(".") || host.endsWith(".")) {
      return false;
    }

    // Must be either 'localhost' or have a dot with a top-level domain of at least 2 chars
    if (host === "localhost") return true;

    const parts = host.split(".");
    if (parts.length < 2) return false;

    const tld = parts[parts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z0-9-]+$/.test(tld)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Normalizes a URL by ensuring it starts with https:// if no protocol is given.
 */
export const normalizeUrl = (str: string): string => {
  if (!str || typeof str !== "string") return "";
  const clean = str.trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  return `https://${clean}`;
};
