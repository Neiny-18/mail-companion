/** Shared helpers for Vercel API routes */

export function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key || typeof key !== "string" || !key.trim()) return null;
  return key.trim();
}

export function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return "";
  return html
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

export function getNeteaseHost(provider) {
  if (provider === "126") return "imap.126.com";
  return "imap.163.com";
}

export function getNeteaseErrorReason(err) {
  const msg = (err?.message || String(err)).toLowerCase();
  if (msg.includes("invalid") && (msg.includes("credential") || msg.includes("auth") || msg.includes("login")))
    return "invalid authorization code";
  if (msg.includes("authentication failed") || msg.includes("login failed")) return "invalid authorization code";
  if (msg.includes("econnrefused") || msg.includes("connection refused")) return "connection refused";
  if (msg.includes("etimedout") || msg.includes("timeout")) return "connection timeout";
  if (msg.includes("imap") && msg.includes("not enabled")) return "IMAP not enabled";
  if (msg.includes("not supported") || msg.includes("unsupported")) return "unsupported provider";
  return err?.message || "IMAP error";
}

export function parseNeteaseEnvelope(envelope) {
  const from = envelope?.from?.[0];
  const fromAddr = from?.address ?? "";
  const fromName = from?.name ?? fromAddr;
  const date = envelope?.date;
  const receivedDateTime = date ? new Date(date).toISOString() : new Date().toISOString();
  return {
    subject: envelope?.subject ?? "(no subject)",
    from: fromName ? `${fromName} <${fromAddr}>` : fromAddr,
    fromAddr,
    fromName,
    receivedDateTime,
  };
}

export function findTextPart(node, path = "1", preferHtml = true) {
  if (!node) return null;
  if (node.type === "text") {
    if (node.subtype === "html") return { path, isHtml: true };
    if (node.subtype === "plain") return { path, isHtml: false };
  }
  if (node.childNodes) {
    let htmlPart = null;
    let plainPart = null;
    for (let i = 0; i < node.childNodes.length; i++) {
      const childPath = path === "1" ? `${i + 1}` : `${path}.${i + 1}`;
      const found = findTextPart(node.childNodes[i], childPath, preferHtml);
      if (found) {
        if (found.isHtml) htmlPart = found;
        else plainPart = found;
      }
    }
    if (preferHtml && htmlPart) return htmlPart;
    if (plainPart) return plainPart;
    return htmlPart;
  }
  return null;
}
