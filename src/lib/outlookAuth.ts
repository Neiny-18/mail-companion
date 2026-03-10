const OUTLOOK_AUTH_KEY = "outlook_auth";
const OUTLOOK_TOKEN_LEGACY = "outlook_token";

/** Redirect URI: prefer env (fixed 8080) so Azure config stays stable across versions. */
export function getRedirectUri(): string {
  const fromEnv = (import.meta.env.VITE_MS_REDIRECT_URI as string)?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/settings`;
  }
  return "";
}

type OutlookAuth = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export function getStoredAuth(): OutlookAuth | null {
  try {
    const raw = localStorage.getItem(OUTLOOK_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OutlookAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: OutlookAuth): void {
  localStorage.setItem(OUTLOOK_AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(OUTLOOK_AUTH_KEY);
  sessionStorage.removeItem(OUTLOOK_TOKEN_LEGACY);
  localStorage.removeItem(OUTLOOK_TOKEN_LEGACY);
}

/** Returns a valid access token, refreshing if expired. Falls back to legacy outlook_token if no auth object. */
export async function getValidAccessToken(): Promise<string | null> {
  const auth = getStoredAuth();
  const now = Date.now();
  const bufferMs = 60_000; // 1 min buffer

  if (auth) {
    if (now < auth.expires_at - bufferMs) {
      return auth.access_token;
    }
    const clientId = import.meta.env.VITE_MS_CLIENT_ID as string | undefined;
    const redirectUri = getRedirectUri();
    if (!clientId) return auth.access_token;

    try {
      const body = new URLSearchParams({
        client_id: clientId,
        refresh_token: auth.refresh_token,
        grant_type: "refresh_token",
        scope: "openid profile offline_access User.Read Mail.Read",
      });
      if (redirectUri) body.set("redirect_uri", redirectUri);

      const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        clearStoredAuth();
        return null;
      }
      const data = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };
      const access_token = data.access_token ?? auth.access_token;
      const refresh_token = data.refresh_token ?? auth.refresh_token;
      const expires_in = data.expires_in ?? 3600;
      const expires_at = now + expires_in * 1000 - bufferMs;
      setStoredAuth({ access_token, refresh_token, expires_at });
      return access_token;
    } catch {
      clearStoredAuth();
      return null;
    }
  }

  const legacy =
    sessionStorage.getItem(OUTLOOK_TOKEN_LEGACY) || localStorage.getItem(OUTLOOK_TOKEN_LEGACY);
  return legacy;
}
