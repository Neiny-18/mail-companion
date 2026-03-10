const EMAIL_TRANSLATIONS_KEY = "emailTranslations";
const EMAIL_SUMMARIES_KEY = "emailSummaries";

const API_BASE = ""; // same origin; Vite proxy forwards /api to server

export type CachedTranslation = {
  translatedText: string;
  originalLanguage: string;
  createdAt: string;
};

export type CachedSummary = {
  summaryText: string;
  createdAt: string;
};

export type TranslateResult = { ok: true; translatedText: string } | { ok: false; reason: string };
export type SummarizeResult = { ok: true; summaryText: string } | { ok: false; reason: string };

function log(msg: string, data?: unknown) {
  const payload = data !== undefined ? ` ${JSON.stringify(data).slice(0, 300)}` : "";
  // eslint-disable-next-line no-console
  console.log(`[emailTranslate] ${msg}${payload}`);
}

/** Detect if content is already Chinese or mostly Chinese */
export function detectEmailLanguage(content: string): "zh" | "other" {
  if (!content || content.trim().length === 0) return "other";
  const trimmed = content.trim();
  let chineseCount = 0;
  let total = 0;
  for (const char of trimmed) {
    if (/\s/.test(char)) continue;
    total += 1;
    if (/[\u4e00-\u9fff]/.test(char)) chineseCount += 1;
  }
  if (total === 0) return "other";
  if (chineseCount / total >= 0.3) return "zh";
  return "other";
}

/** NetEase config from localStorage (set by Settings when connected) */
export function getNeteaseConfig(): { email: string; appPassword: string; provider: "163" | "126" } | null {
  try {
    const email = localStorage.getItem("netease_email");
    const appPassword = localStorage.getItem("netease_app_password");
    const provider = localStorage.getItem("netease_provider") === "126" ? "126" : "163";
    if (!email || !appPassword) return null;
    return { email, appPassword, provider };
  } catch {
    return null;
  }
}

/** Fetch full email body for NetEase (via server IMAP) */
export async function fetchNetEaseEmailBody(
  emailId: string,
  config: { email: string; appPassword: string; provider: "163" | "126" }
): Promise<string> {
  const uid = emailId.replace(/^netease:/, "");
  const res = await fetch(`${API_BASE}/api/netease-email-body`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: config.email,
      appPassword: config.appPassword,
      provider: config.provider,
      uid,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    let reason = "request failed";
    try {
      const j = JSON.parse(text) as { reason?: string };
      if (j.reason) reason = j.reason;
    } catch (_) {}
    throw new Error(reason);
  }
  const data = (await res.json()) as { body?: string };
  return data.body ?? "";
}

/** Fetch full email body from Microsoft Graph */
export async function fetchFullEmailBody(
  emailId: string,
  accessToken: string
): Promise<string> {
  const url = `https://graph.microsoft.com/v1.0/me/messages/${emailId}?$select=body,subject,from,receivedDateTime,webLink`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    log("fetchFullEmailBody failed", { status: res.status, body: text.slice(0, 200) });
    throw new Error(`Graph API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    body?: { content?: string; contentType?: string };
  };
  const content = data.body?.content ?? "";
  return content;
}

/** Normalize HTML to readable text before sending to API */
function normalizeContent(content: string): string {
  if (!content || typeof content !== "string") return "";
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Call server API to translate email content into Chinese */
export async function translateEmailContent(content: string): Promise<string> {
  const endpoint = `${API_BASE}/api/translate-email`;
  const model = "gemini-2.5-flash";
  log("translate: request", { endpoint, model, contentLength: content?.length });

  const body = JSON.stringify({ content: normalizeContent(content) });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const status = res.status;
  const text = await res.text();
  log("translate: response", { status, bodyLength: text.length });

  let json: { ok?: boolean; translatedText?: string; error?: string; reason?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch (e) {
    log("translate: parse error", (e as Error).message);
    throw new Error("response parse failed");
  }

  if (json.ok === true && typeof json.translatedText === "string") {
    return json.translatedText;
  }

  const reason = json.reason || json.error || "request failed";
  log("translate: failed", { reason, status });
  throw new Error(reason);
}

/** Call server API to summarize email (actionable info in Chinese) */
export async function summarizeEmail(
  content: string,
  subject: string,
  from: string
): Promise<string> {
  const endpoint = `${API_BASE}/api/summarize-email`;
  const model = "gemini-2.5-flash";
  log("summarize: request", { endpoint, model, contentLength: content?.length });

  const body = JSON.stringify({
    content: normalizeContent(content),
    subject,
    from,
  });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const status = res.status;
  const text = await res.text();
  log("summarize: response", { status, bodyLength: text.length });

  let json: { ok?: boolean; summaryText?: string; error?: string; reason?: string };
  try {
    json = JSON.parse(text) as typeof json;
  } catch (e) {
    log("summarize: parse error", (e as Error).message);
    throw new Error("response parse failed");
  }

  if (json.ok === true && typeof json.summaryText === "string") {
    return json.summaryText;
  }

  const reason = json.reason || json.error || "request failed";
  log("summarize: failed", { reason, status });
  throw new Error(reason);
}

export function getCachedTranslation(
  emailId: string
): CachedTranslation | null {
  try {
    const raw = localStorage.getItem(EMAIL_TRANSLATIONS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, CachedTranslation>;
    return map[emailId] ?? null;
  } catch {
    return null;
  }
}

export function setCachedTranslation(
  emailId: string,
  data: CachedTranslation
): void {
  try {
    const raw = localStorage.getItem(EMAIL_TRANSLATIONS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, CachedTranslation>) : {};
    map[emailId] = data;
    localStorage.setItem(EMAIL_TRANSLATIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getCachedSummary(emailId: string): CachedSummary | null {
  try {
    const raw = localStorage.getItem(EMAIL_SUMMARIES_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, CachedSummary>;
    return map[emailId] ?? null;
  } catch {
    return null;
  }
}

export function setCachedSummary(emailId: string, data: CachedSummary): void {
  try {
    const raw = localStorage.getItem(EMAIL_SUMMARIES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, CachedSummary>) : {};
    map[emailId] = data;
    localStorage.setItem(EMAIL_SUMMARIES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
